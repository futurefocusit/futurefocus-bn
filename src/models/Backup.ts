import mongoose, { Schema, Document } from 'mongoose';

export interface IBackup extends Document {
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    startTime: Date;
    endTime?: Date;
    sourceDatabase: string;
    targetDatabase: string;
    error?: string;
    collections: {
        name: string;
        status: 'pending' | 'completed' | 'failed';
        documentCount: number;
        error?: string;
    }[];
}

const BackupSchema: Schema = new Schema({
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'failed'],
        default: 'pending'
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    sourceDatabase: {
        type: String,
        required: true
    },
    targetDatabase: {
        type: String,
        required: true
    },
    error: {
        type: String
    },
    collections: [{
        name: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending'
        },
        documentCount: {
            type: Number,
            default: 0
        },
        error: {
            type: String
        }
    }]
});

export default mongoose.model<IBackup>('Backup', BackupSchema); 