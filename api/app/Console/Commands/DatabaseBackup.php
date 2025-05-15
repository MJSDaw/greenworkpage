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
     * The backup directory paths
     * 
     * @var array
     */
    protected $backupDirs = [
        '/var/www/html/storage/app/backups',  // Inside container storage
        '/var/www/html/backups'               // Project root backups folder
    ];

    /**
     * The maximum number of backups to keep
     * 
     * @var int
     */
    protected $maxBackups = 2;

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Set backup file name with current date
        $filename = 'backup_' . Carbon::now()->format('Y-m-d_H-i-s') . '.sql';
        
        // Create backups directories if they don't exist
        foreach ($this->backupDirs as $dir) {
            if (!is_dir($dir)) {
                if (mkdir($dir, 0755, true)) {
                    $this->info("Created backup directory: {$dir}");
                } else {
                    $this->warn("Failed to create backup directory: {$dir}");
                }
            }
        }
        
        // Primary backup path (first in the array)
        $primaryBackupPath = $this->backupDirs[0] . '/' . $filename;
        
        // Get database configuration
        $dbHost = config('database.connections.pgsql.host');
        $dbPort = config('database.connections.pgsql.port');
        $dbName = config('database.connections.pgsql.database');
        $dbUsername = config('database.connections.pgsql.username');
        $dbPassword = config('database.connections.pgsql.password');
        
        // Command to create backup
        $command = "PGPASSWORD={$dbPassword} pg_dump -h {$dbHost} -p {$dbPort} -U {$dbUsername} -d {$dbName} -F p -f {$primaryBackupPath}";
        
        try {
            // Execute backup command
            $this->info('Backup in progress...');
            exec($command, $output, $returnVar);
            
            if ($returnVar === 0) {
                $this->info('Database backup completed successfully.');
                $this->info("Primary backup stored at: {$primaryBackupPath}");
                
                // Check if the primary backup file exists
                if (file_exists($primaryBackupPath)) {
                    $fileSize = $this->formatSize(filesize($primaryBackupPath));
                    $this->info("Backup file created with size: {$fileSize}");
                    
                    // Copy to additional backup locations
                    for ($i = 1; $i < count($this->backupDirs); $i++) {
                        $additionalPath = $this->backupDirs[$i] . '/' . $filename;
                        if (copy($primaryBackupPath, $additionalPath)) {
                            $this->info("Backup copied to: {$additionalPath}");
                        } else {
                            $this->warn("Failed to copy backup to: {$additionalPath}");
                        }
                    }
                    
                    Log::info("Database backup completed successfully. File: {$filename}");
                } else {
                    $this->warn("Warning: Backup file was not found at: {$primaryBackupPath}");
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
        
        foreach ($this->backupDirs as $dir) {
            if (!file_exists($dir)) {
                $this->warn("Backup directory does not exist: {$dir}");
                continue;
            }
            
            // Get all backup files in the backup directory
            $files = glob($dir . '/*.sql');
            
            $this->info("Found " . count($files) . " backup files in directory: {$dir}");
            
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
                        $this->info("Deleted old backup: " . basename($file) . " from {$dir}");
                        Log::info("Deleted old backup: " . basename($file) . " from {$dir}");
                    } else {
                        $this->error("Failed to delete old backup: " . basename($file) . " from {$dir}");
                        Log::error("Failed to delete old backup: " . basename($file) . " from {$dir}");
                    }
                }
            } else {
                $this->info("No old backups to clean in {$dir}. Current count: " . count($files) . ", Max allowed: {$this->maxBackups}");
            }
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
