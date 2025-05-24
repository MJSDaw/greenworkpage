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
            // Set up variables - use the backups directory as mounted in Docker
            $backupDir = base_path('backups');  // Directory is mounted at /var/www/html/backups in Docker
            $timestamp = date('Ymd_His');
            $backupFile = "$backupDir/greenworkdb_backup_$timestamp.sql";
            
            // Make sure backup directory exists and is writable
            if (!file_exists($backupDir)) {
                if (!@mkdir($backupDir, 0755, true)) {
                    throw new \Exception("Failed to create backup directory at $backupDir");
                }
            }

            // Ensure directory is writable
            if (!is_writable($backupDir)) {
                throw new \Exception("Backup directory is not writable: $backupDir");
            }
            
            // Get database connection details from Docker environment variables
            $host = env('DB_HOST', 'postgres');  // Use the postgres service name from docker-compose.yml
            $port = env('DB_PORT', '5432');
            $database = env('DB_DATABASE', 'greenworkdb');
            $username = config('database.connections.pgsql.username');
            $password = config('database.connections.pgsql.password');
            
            // Build pg_dump command with error redirection and absolute path
            $command = sprintf(
                'PGPASSWORD=%s /usr/bin/pg_dump -h %s -p %s -U %s -d %s -F p -v > %s 2>&1',
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
            
            // Log the command (without password)
            $logCommand = preg_replace('/PGPASSWORD=\'[^\']+\'/', 'PGPASSWORD=***', $command);
            Log::info("Executing backup command: " . $logCommand);
            
            exec($command . ' 2>&1', $output, $returnVar);
            
            if ($returnVar !== 0) {
                $error = 'Database backup failed: ' . implode("\n", $output);
                $this->error($error);
                Log::error($error);
                throw new \Exception($error);
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
            
            // Set proper ownership of backup file
            exec('chown www-data:www-data ' . escapeshellarg($backupFile . '.gz'));
            
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
