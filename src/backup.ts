import { MongoClient, ChangeStream, ResumeToken, ChangeStreamDocument } from 'mongodb';
import fs from 'fs/promises';

interface BackupOptions {
    databases?: string[];
    collections?: string[];
    batchSize?: number;
    resumeTokenFile?: string;
    resumeTokenSaveInterval?: number;
}

class MongoDBRealtimeBackup {
    sourceUri: string;
    targetUri: string;
    options: Required<BackupOptions>;
    sourceClient: MongoClient | null = null;
    targetClient: MongoClient | null = null;
    currentResumeToken: ResumeToken | null = null;
    lastSavedToken: ResumeToken | null = null;
    tokenSaveTimer: NodeJS.Timeout | null = null;

    constructor(sourceUri: string, targetUri: string, options: BackupOptions = {}) {
        this.sourceUri = sourceUri;
        this.targetUri = targetUri;
        this.options = {
            databases: options.databases ?? [],
            collections: options.collections ?? [],
            batchSize: options.batchSize ?? 1000,
            resumeTokenFile: options.resumeTokenFile ?? './resume-token.json',
            resumeTokenSaveInterval: options.resumeTokenSaveInterval ?? 10000,
        };
    }

    async connect() {
        this.sourceClient = new MongoClient(this.sourceUri);
        this.targetClient = new MongoClient(this.targetUri);

        await this.sourceClient.connect();
        await this.targetClient.connect();

        console.log('Connected to both source and target MongoDB instances');

        await this.loadResumeToken();
    }

    async loadResumeToken() {
        try {
            const tokenData = await fs.readFile(this.options.resumeTokenFile, 'utf8');
            const parsed = JSON.parse(tokenData);
            this.currentResumeToken = parsed.resumeToken;
            console.log('Loaded resume token from file:', parsed.timestamp);
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                console.warn('Error loading resume token:', error.message);
            } else {
                console.log('No existing resume token found, starting fresh');
            }
            this.currentResumeToken = null;
        }
    }

    async saveResumeToken(resumeToken: ResumeToken | null) {
        if (!resumeToken) {
            console.log('No resume token to save');
            return;
        }

        // Compare tokens properly - they might be complex objects
        const currentTokenStr = JSON.stringify(resumeToken);
        const lastSavedTokenStr = JSON.stringify(this.lastSavedToken);
        
        if (currentTokenStr === lastSavedTokenStr) {
            return; // No change in token
        }

        try {
            const tokenData = {
                resumeToken,
                timestamp: new Date().toISOString(),
                sourceUri: this.sourceUri.replace(/\/\/[^@]+@/, '//***:***@'), // Hide credentials
                targetUri: this.targetUri.replace(/\/\/[^@]+@/, '//***:***@'),
            };

            console.log('Saving resume token to:', this.options.resumeTokenFile);
            
            await fs.writeFile(
                this.options.resumeTokenFile,
                JSON.stringify(tokenData, null, 2),
                'utf8'
            );

            this.lastSavedToken = resumeToken;
            console.log('Resume token saved at:', tokenData.timestamp);
        } catch (error: any) {
            console.error('Error saving resume token:', error.message, error.stack);
        }
    }

    startTokenSaveTimer() {
        if (this.tokenSaveTimer) {
            clearInterval(this.tokenSaveTimer);
        }

        console.log(`Starting token save timer with interval: ${this.options.resumeTokenSaveInterval}ms`);
        
        this.tokenSaveTimer = setInterval(async () => {
            if (this.currentResumeToken) {
                console.log('Timer triggered - saving resume token');
                await this.saveResumeToken(this.currentResumeToken);
            } else {
                console.log('Timer triggered - no resume token to save');
            }
        }, this.options.resumeTokenSaveInterval);
    }

    stopTokenSaveTimer() {
        if (this.tokenSaveTimer) {
            clearInterval(this.tokenSaveTimer);
            this.tokenSaveTimer = null;
            console.log('Token save timer stopped');
        }
    }

    async initialSync() {
        if (!this.sourceClient || !this.targetClient) throw new Error('Clients not connected');

        console.log('Starting initial synchronization...');

        const admin = this.sourceClient.db().admin();
        const databases = await admin.listDatabases();

        for (const dbInfo of databases.databases) {
            if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;

            if (
                this.options.databases.length > 0 &&
                !this.options.databases.includes(dbInfo.name)
            ) {
                continue;
            }

            await this.syncDatabase(dbInfo.name);
        }

        console.log('Initial synchronization completed');
    }

    async syncDatabase(dbName: string) {
        if (!this.sourceClient || !this.targetClient) throw new Error('Clients not connected');

        console.log(`Syncing database: ${dbName}`);

        const sourceDb = this.sourceClient.db(dbName);
        const targetDb = this.targetClient.db(dbName);

        const collections = await sourceDb.listCollections().toArray();

        for (const collInfo of collections) {
            if (
                this.options.collections.length > 0 &&
                !this.options.collections.includes(collInfo.name)
            ) {
                continue;
            }

            await this.syncCollection(dbName, collInfo.name);
        }
    }

    async syncCollection(dbName: string, collectionName: string) {
        if (!this.sourceClient || !this.targetClient) throw new Error('Clients not connected');

        console.log(`Syncing collection: ${dbName}.${collectionName}`);

        const sourceCollection = this.sourceClient.db(dbName).collection(collectionName);
        const targetCollection = this.targetClient.db(dbName).collection(collectionName);

        try {
            await targetCollection.drop();
        } catch {
            // ignore if does not exist
        }

        const cursor = sourceCollection.find({});
        const documents = [];

        while (await cursor.hasNext()) {
            const doc = await cursor.next();
            if (doc) documents.push(doc);

            if (documents.length >= this.options.batchSize) {
                await targetCollection.insertMany(documents);
                documents.length = 0;
            }
        }

        if (documents.length > 0) {
            await targetCollection.insertMany(documents);
        }

        const indexes = await sourceCollection.listIndexes().toArray();
        for (const index of indexes) {
            if (index.name !== '_id_') {
                try {
                    const indexSpec = { ...index };
                    // Remove properties that aren't index options
                    delete indexSpec.v;
                    delete indexSpec.ns;
                    delete indexSpec.key;
                    
                    await targetCollection.createIndex(index.key, indexSpec);
                } catch (error) {
                    console.warn(`Failed to create index ${index.name}:`, (error as Error).message);
                }
            }
        }
    }

    async startRealtimeSync() {
        if (!this.sourceClient || !this.targetClient) throw new Error('Clients not connected');

        console.log('Starting real-time synchronization...');

        const pipeline: object[] = [];

        if (this.options.databases.length > 0) {
            pipeline.push({
                $match: {
                    'ns.db': { $in: this.options.databases },
                },
            });
        }

        if (this.options.collections.length > 0) {
            pipeline.push({
                $match: {
                    'ns.coll': { $in: this.options.collections },
                },
            });
        }

        const changeStreamOptions: any = {
            fullDocument: 'updateLookup',
            fullDocumentBeforeChange: 'whenAvailable',
        };

        if (this.currentResumeToken) {
            changeStreamOptions.resumeAfter = this.currentResumeToken;
            console.log('Resuming from saved token:', JSON.stringify(this.currentResumeToken));
        } else {
            // Get cluster time for starting point
            try {
                const clusterTime = await this.sourceClient.db().admin().command({ hello: 1 });
                if (clusterTime.$clusterTime?.clusterTime) {
                    changeStreamOptions.startAtOperationTime = clusterTime.$clusterTime.clusterTime;
                    console.log('Starting from cluster time:', clusterTime.$clusterTime.clusterTime);
                }
            } catch (error) {
                console.warn('Could not get cluster time, starting from now');
            }
        }

        const changeStream = this.sourceClient.db().watch(pipeline, changeStreamOptions);

        this.startTokenSaveTimer();

        changeStream.on('change', async (change: ChangeStreamDocument) => {
            try {
                // Update resume token FIRST
                this.currentResumeToken = change._id;
                console.log('Updated resume token from change event');
                
                await this.handleChange(change);
                
                // Save token immediately after successful processing
                await this.saveResumeToken(this.currentResumeToken);
                
            } catch (error) {
                console.error('Error handling change:', error);
                // Save token even on error to avoid reprocessing
                await this.saveResumeToken(this.currentResumeToken);
            }
        });

        changeStream.on('error', async (error) => {
            console.error('Change stream error:', error);
            
            // Save current token before handling error
            if (this.currentResumeToken) {
                await this.saveResumeToken(this.currentResumeToken);
            }
            
            // Don't restart automatically here to avoid infinite loops
            // Let the calling code handle restart logic
            throw error;
        });

        changeStream.on('close', async () => {
            console.log('Change stream closed');
            this.stopTokenSaveTimer();
            
            if (this.currentResumeToken) {
                await this.saveResumeToken(this.currentResumeToken);
            }
        });

        // Get initial resume token from change stream
        // changeStream.on('resumeTokenChanged', (resumeToken) => {
        //     console.log('Resume token changed event:', resumeToken);
        //     this.currentResumeToken = resumeToken;
        // });

        return changeStream;
    }

    async handleChangeStreamError(error: any, retryCount = 0): Promise<ChangeStream> {
        const maxRetries = 5;
        const baseDelay = 1000; // 1 second

        if (retryCount >= maxRetries) {
            console.error('Max retries reached, giving up');
            throw error;
        }

        const delay = baseDelay * Math.pow(2, retryCount);
        console.log(`Retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);

        await new Promise((resolve) => setTimeout(resolve, delay));

        try {
            console.log('Attempting to restart change stream...');
            return await this.startRealtimeSync();
        } catch (retryError) {
            console.error('Retry failed:', (retryError as Error).message);
            return await this.handleChangeStreamError(retryError, retryCount + 1);
        }
    }

    async handleChange(change: ChangeStreamDocument) {
        const { operationType, ns, documentKey, fullDocument } = change as any;

        if (!ns || !ns.db || !ns.coll) {
            console.warn('Namespace info missing in change event');
            return;
        }

        if (!this.targetClient) throw new Error('Target client not connected');

        const targetDb = this.targetClient.db(ns.db);
        const targetCollection = targetDb.collection(ns.coll);

        console.log(`Processing ${operationType} on ${ns.db}.${ns.coll}`);

        switch (operationType) {
            case 'insert':
                if (fullDocument) await targetCollection.insertOne(fullDocument);
                break;

            case 'update':
            case 'replace':
                if (fullDocument && documentKey) {
                    await targetCollection.replaceOne({ _id: documentKey._id }, fullDocument, {
                        upsert: true,
                    });
                }
                break;

            case 'delete':
                if (documentKey) {
                    await targetCollection.deleteOne({ _id: documentKey._id });
                }
                break;

            case 'drop':
                try {
                    await targetCollection.drop();
                } catch {
                    // ignore
                }
                break;

            case 'dropDatabase':
                try {
                    await targetDb.dropDatabase();
                } catch {
                    // ignore
                }
                break;

            default:
                console.log(`Unhandled operation type: ${operationType}`);
        }
    }

    async close() {
        console.log('Closing connections...');

        this.stopTokenSaveTimer();

        if (this.currentResumeToken) {
            await this.saveResumeToken(this.currentResumeToken);
        }

        if (this.sourceClient) {
            await this.sourceClient.close();
            this.sourceClient = null;
        }
        if (this.targetClient) {
            await this.targetClient.close();
            this.targetClient = null;
        }
    }
}

 export default async function startBackup() {
    const sourceUri = process.env.MONGODB_URI!;
    const targetUri = process.env.BACKUP_MONGODB_URI!;
    console.log('Source URI configured:', !!sourceUri);
    console.log('Target URI configured:', !!targetUri);

    const backup = new MongoDBRealtimeBackup(sourceUri, targetUri, {
        databases: ['xcool'],
        collections: [],
        batchSize: 1000,
        resumeTokenFile: './resume-token.json',
        resumeTokenSaveInterval: 5000, // Save every 5 seconds for testing
    });

    let changeStream: ChangeStream | null = null; 

    try {
        await backup.connect();

        if (!backup.currentResumeToken) {
            console.log('No resume token found, performing initial sync...');
            await backup.initialSync();
        } else {
            console.log('Resume token found, skipping initial sync');
        }

        // Start change stream with retry logic
        const startChangeStream = async () => {
            try {
                changeStream = await backup.startRealtimeSync();
                console.log('Change stream started successfully');
            } catch (error) {
                console.error('Failed to start change stream:', error);
                // Retry after delay
                setTimeout(startChangeStream, 5000);
            }
        };

        await startChangeStream();

        const shutdown = async () => {
            console.log('SIGINT received, shutting down...');
            if (changeStream) {
                await changeStream.close();
            }
            await backup.close();
            process.exit(0);
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

        // Keep process alive
        console.log('Backup service running... Press Ctrl+C to exit');
        
    } catch (error) {
        console.error('Error in main:', error);
        await backup.close();
        process.exit(1);
    }
}


