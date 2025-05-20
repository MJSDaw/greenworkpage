<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\AuditController;

class BackupDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:backup {--admin_id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a backup of the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            // Set up variables
            $backupDir = base_path('backups');
            $timestamp = date('Ymd_His');
            $backupFile = "$backupDir/greenworkdb_backup_$timestamp.sql";
            
            // Make sure backup directory exists
            if (!file_exists($backupDir)) {
                mkdir($backupDir, 0755, true);
            }
            
            // Get database connection details from config
            $host = config('database.connections.pgsql.host');
            $port = config('database.connections.pgsql.port');
            $database = config('database.connections.pgsql.database');
            $username = config('database.connections.pgsql.username');
            $password = config('database.connections.pgsql.password');
            
            // Build pg_dump command
            $command = sprintf(
                'PGPASSWORD=%s pg_dump -h %s -p %s -U %s -d %s -F p > %s',
                escapeshellarg($password),
                escapeshellarg($host),
                escapeshellarg($port),
                escapeshellarg($username),
                escapeshellarg($database),
                escapeshellarg($backupFile)
            );
            
            // Execute the command
            $this->info("Starting database backup...");
            $output = [];
            $returnVar = 0;
            exec($command, $output, $returnVar);
            
            if ($returnVar !== 0) {
                $error = 'Database backup failed: ' . implode("\n", $output);
                $this->error($error);
                Log::error($error);
                return 1;
            }
              // Compress the backup file
            $this->info("Compressing backup file...");
            $gzipCommand = sprintf('gzip %s', escapeshellarg($backupFile));
            exec($gzipCommand, $output, $returnVar);
            
            if ($returnVar !== 0) {
                $error = 'Failed to compress backup file';
                $this->error($error);
                Log::error($error);
                return 1;
            }
            
            // Keep only the 3 most recent backups
            $this->info("Keeping only the 3 most recent backups...");
            $pattern = $backupDir . '/greenworkdb_backup_*.sql.gz';
            $files = glob($pattern);
            
            // Sort files by modification time (oldest first)
            usort($files, function($a, $b) {
                return filemtime($a) - filemtime($b);
            });
            
            // Delete all but the 3 newest files
            $filesToKeep = 3;
            $numToDelete = count($files) - $filesToKeep;
            
            if ($numToDelete > 0) {
                $this->info("Deleting {$numToDelete} old backup(s)...");
                for ($i = 0; $i < $numToDelete; $i++) {
                    unlink($files[$i]);
                    $this->info("Deleted: " . basename($files[$i]));
                    Log::info("Deleted old backup: " . basename($files[$i]));
                }
            }
            
            // Create audit record
            $adminId = $this->option('admin_id');
            if ($adminId) {
                AuditController::registerAudit(
                    'backup',
                    'database',
                    null,
                    null,
                    ['backup_file' => "$backupFile.gz"]
                );
            }
            
            $this->info("Backup completed successfully: {$backupFile}.gz");
            Log::info("Database backup created: {$backupFile}.gz");
            return 0;
            
        } catch (\Exception $e) {
            $this->error("Backup failed: " . $e->getMessage());
            Log::error("Database backup failed: " . $e->getMessage());
            return 1;
        }
    }
}
