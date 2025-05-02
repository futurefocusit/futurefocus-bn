import { Request, Response } from 'express';
// import { BackupService } from '../services/BackupService';

// export class BackupController {
//     // private backupService: BackupService;

//     constructor(sourceUri: string, targetUri: string) {
//         this.backupService = new BackupService(sourceUri, targetUri);
//     }

//     startBackup = async (req: Request, res: Response) => {
//         try {
//             const backup = await this.backupService.startBackup();
//             res.status(201).json({
//                 message: 'Backup started successfully',
//                 backupId: backup._id
//             });
//         } catch (error) {
//             console.error('Backup start error:', error);
//             res.status(500).json({
//                 message: 'Failed to start backup',
//                 error: error instanceof Error ? error.message : 'Unknown error'
//             });
//         }
//     };

//     getBackupStatus = async (req: Request, res: Response) => {
//         try {
//             const { backupId } = req.params;
//             const backup = await this.backupService.getBackupStatus(backupId);

//             if (!backup) {
//                 return res.status(404).json({ message: 'Backup not found' });
//             }

//             res.status(200).json(backup);
//         } catch (error) {
//             console.error('Backup status error:', error);
//             res.status(500).json({
//                 message: 'Failed to get backup status',
//                 error: error instanceof Error ? error.message : 'Unknown error'
//             });
//         }
//     };

//     getRecentBackups = async (req: Request, res: Response) => {
//         try {
//             const limit = parseInt(req.query.limit as string) || 10;
//             const backups = await this.backupService.getRecentBackups(limit);
//             res.status(200).json(backups);
//         } catch (error) {
//             console.error('Recent backups error:', error);
//             res.status(500).json({
//                 message: 'Failed to get recent backups',
//                 error: error instanceof Error ? error.message : 'Unknown error'
//             });
//         }
//     };

//     getBackupStatistics = async (req: Request, res: Response) => {
//         try {
//             const stats = await this.backupService.getBackupStatistics();
//             res.status(200).json(stats);
//         } catch (error) {
//             console.error('Backup statistics error:', error);
//             res.status(500).json({
//                 message: 'Failed to get backup statistics',
//                 error: error instanceof Error ? error.message : 'Unknown error'
//             });
//         }
//     };
// } 