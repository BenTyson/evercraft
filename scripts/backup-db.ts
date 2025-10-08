/**
 * Database Backup Script
 *
 * Creates a backup of the PostgreSQL database using pg_dump
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve } from 'path';

const execAsync = promisify(exec);

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const backupDir = resolve(process.cwd(), 'backups');
  const backupFile = resolve(backupDir, `evercraft-backup-${timestamp}.sql`);

  try {
    // Create backups directory if it doesn't exist
    if (!existsSync(backupDir)) {
      await mkdir(backupDir, { recursive: true });
      console.log('📁 Created backups directory');
    }

    console.log('💾 Starting database backup...');
    console.log(`📍 Backup location: ${backupFile}`);

    // Run pg_dump
    const { stderr } = await execAsync(`pg_dump -U bentyson -d evercraft -F p -f "${backupFile}"`);

    if (stderr && !stderr.includes('WARNING')) {
      console.error('⚠️  Backup warnings:', stderr);
    }

    console.log('✅ Database backup completed successfully!');
    console.log(`📦 Backup saved to: ${backupFile}`);

    // Get file size
    const { stdout: sizeOutput } = await execAsync(`du -h "${backupFile}"`);
    const size = sizeOutput.split('\t')[0];
    console.log(`📊 Backup size: ${size}`);

    return backupFile;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

// Run backup
backupDatabase()
  .then(() => {
    console.log('\n🎉 Backup process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Backup process failed:', error.message);
    process.exit(1);
  });
