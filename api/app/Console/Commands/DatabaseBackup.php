<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class DatabaseBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:backup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a backup of the database';

    /**
     * The maximum number of backups to keep
     * 
     * @var int
     */
    protected $maxBackups = 2;

    /**
     * The backup directory path
     * 
     * @var string
     */
    protected $backupDir = '/var/www/html/storage/app/backups';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Create backups directory if it doesn't exist
        if (!is_dir($this->backupDir)) {
            mkdir($this->backupDir, 0755, true);
            $this->info("Created project backups directory: {$this->backupDir}");
        }

        // Set backup file name with current date
        $filename = 'backup_' . Carbon::now()->format('Y-m-d_H-i-s') . '.sql';
        
        // Path where the backup will be stored
        $backupPath = $this->backupDir . '/' . $filename;
        
        // Get database configuration
        $dbHost = config('database.connections.pgsql.host');
        $dbPort = config('database.connections.pgsql.port');
        $dbName = config('database.connections.pgsql.database');
        $dbUsername = config('database.connections.pgsql.username');
        $dbPassword = config('database.connections.pgsql.password');
        
        // Command to create backup
        $command = "PGPASSWORD={$dbPassword} pg_dump -h {$dbHost} -p {$dbPort} -U {$dbUsername} -d {$dbName} -F p -f {$backupPath}";
        
        try {
            // Execute backup command
            $this->info('Backup in progress...');
            exec($command, $output, $returnVar);
            
            if ($returnVar === 0) {
                $this->info('Database backup completed successfully.');
                $this->info("Backup stored at: {$backupPath}");
                
                // Double-check the file exists
                if (file_exists($backupPath)) {
                    $fileSize = $this->formatSize(filesize($backupPath));
                    $this->info("Backup file exists with size: {$fileSize}");
                } else {
                    $this->warn("Warning: Backup file was not found at: {$backupPath}");
                    // Try to find where the file might have been created
                    $this->info("Searching for the backup file...");
                    $possibleLocations = [
                        getcwd(), // Current working directory
                        dirname(getcwd()), // Parent of current working directory
                        '/var/www/html', // Common Docker container path
                        '/var/www/html/storage/app/backups', // Expected Docker path in Laravel
                    ];
                    
                    foreach ($possibleLocations as $location) {
                        $searchPattern = $location . "/*backup*";
                        $foundFiles = glob($searchPattern);
                        if (!empty($foundFiles)) {
                            $this->info("Found possible backup files at: {$location}");
                            foreach ($foundFiles as $file) {
                                $this->info("- {$file} (" . $this->formatSize(filesize($file)) . ")");
                            }
                        }
                    }
                }
                
                Log::info("Database backup completed successfully. File: {$filename}");
            } else {
                $this->error('Database backup failed.');
                Log::error("Database backup failed with error code: {$returnVar}");
            }
        } catch (\Exception $e) {
            $this->error("An error occurred during backup: {$e->getMessage()}");
            Log::error("Backup error: {$e->getMessage()}");
        }
        
        // Clean up old backups (keep only the most recent N backups)
        $this->cleanOldBackups();
    }

    /**
     * Clean up backups to keep only the most recent N backups
     */
    protected function cleanOldBackups()
    {
        $this->info('Cleaning old backups...');
        
        // Get all backup files in the project backups directory
        $files = glob($this->backupDir . '/*.sql');
        
        $this->info("Found " . count($files) . " backup files in directory");
        
        // Display information about found backups
        foreach ($files as $file) {
            $this->info("Found backup: " . basename($file) . " (Modified: " . date('Y-m-d H:i:s', filemtime($file)) . ")");
        }
        
        // If we have more files than the max limit, delete the oldest ones
        if (count($files) > $this->maxBackups) {
            // Sort files by last modified time (oldest first)
            usort($files, function($a, $b) {
                // Check if files exist before trying to get mtime
                $timeA = file_exists($a) ? filemtime($a) : 0;
                $timeB = file_exists($b) ? filemtime($b) : 0;
                return $timeA - $timeB;
            });
            
            // Delete oldest files until we're at the limit
            $filesToDelete = array_slice($files, 0, count($files) - $this->maxBackups);
            
            foreach ($filesToDelete as $file) {
                if (unlink($file)) {
                    $this->info("Deleted old backup: " . basename($file));
                    Log::info("Deleted old backup: " . basename($file));
                } else {
                    $this->error("Failed to delete old backup: " . basename($file));
                    Log::error("Failed to delete old backup: " . basename($file));
                }
            }
        } else {
            $this->info("No old backups to clean. Current count: " . count($files) . ", Max allowed: {$this->maxBackups}");
        }
    }
    
    /**
     * Format file size in a human-readable way
     */
    protected function formatSize($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
