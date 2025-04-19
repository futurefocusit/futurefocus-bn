import cron from "node-cron";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const execAsync = promisify(exec);

export const backup = async () => {
  const backupDir = path.join(__dirname, "mongodb-backup");

  const getTimestamp = () => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  };
  cron.schedule("41 16 * * *", async () => {
    try {
      console.log("Running MongoDB backup...");

      // Ensure backup directory exists
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Create MongoDB dump
      const dumpCommand = `mongodump --uri ${process.env.MONGODB_URI} --out ${backupDir}`;
      await execAsync(dumpCommand);
      console.log("MongoDB backup created successfully.");

      // Get timestamp for the current backup
      const timestamp = getTimestamp();
      const backupName = `backup-${timestamp}`;

      // First, list existing backups in Mega
      const listCommand = `rclone lsf mega:/mongodb-backups/`;
      const { stdout: existingBackups } = await execAsync(listCommand);

      // Upload new backup
      const uploadCommand = `rclone copy ${backupDir} mega:/mongodb-backups/${backupName}`;
      await execAsync(uploadCommand);
      console.log(`Backup successfully uploaded to Mega as ${backupName}`);

      // Delete old backups (keep last 7 days)
      const backupsList = existingBackups.split("\n").filter(Boolean);
      const keepDays = 7;

      if (backupsList.length > keepDays) {
        const sortedBackups = backupsList.sort().reverse();
        const backupsToDelete = sortedBackups.slice(keepDays);

        for (const oldBackup of backupsToDelete) {
          const deleteCommand = `rclone purge mega:/mongodb-backups/${oldBackup}`;
          await execAsync(deleteCommand);
          console.log(`Deleted old backup: ${oldBackup}`);
        }
      }

      fs.rmSync(backupDir, { recursive: true, force: true });
      console.log("Local backup directory cleaned up.");
    } catch (error) {
      console.error("Backup process failed:", error);

      if (fs.existsSync(backupDir)) {
        fs.rmSync(backupDir, { recursive: true, force: true });
      }
    }
  });

  console.log(
    "Cron job scheduled. The MongoDB backup will run at 12:04 PM daily."
  );
};
