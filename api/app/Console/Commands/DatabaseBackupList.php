<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class DatabaseBackupList extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:backup:list';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List all database backups';

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
        $this->info('Checking for database backups...');
        
        // Check project backups directory
        if (file_exists($this->backupDir)) {
            $backupFiles = glob($this->backupDir . '/*.sql');
            
            if (count($backupFiles) > 0) {
                $this->info('Found ' . count($backupFiles) . ' backup files in project directory:');
                $rows = [];
                foreach ($backupFiles as $file) {
                    $rows[] = [
                        basename($file),
                        $this->formatSize(filesize($file)),
                        date('Y-m-d H:i:s', filemtime($file))
                    ];
                }
                $this->table(['Filename', 'Size', 'Last Modified'], $rows);
            } else {
                $this->warn('No backup files found in project directory.');
            }
        } else {
            $this->warn('Project backup directory does not exist: ' . $this->backupDir);
            
            // Try to create it
            if (mkdir($this->backupDir, 0755, true)) {
                $this->info('Created project backup directory: ' . $this->backupDir);
            } else {
                $this->error('Failed to create project backup directory: ' . $this->backupDir);
            }
        }
        
        // Check Docker permissions
        $this->info('Checking Docker container environment...');
        
        try {
            $containerUser = exec('whoami');
            $containerInfo = exec('id');
            $this->info("Container running as: {$containerUser}");
            $this->info("User details: {$containerInfo}");
            
            // Check permissions on storage directory
            $storagePath = storage_path();
            $storagePermissions = substr(sprintf('%o', fileperms($storagePath)), -4);
            $appPath = storage_path('app');
            $appPermissions = substr(sprintf('%o', fileperms($appPath)), -4);
            
            $this->info("Storage directory: {$storagePath} (Permissions: {$storagePermissions})");
            $this->info("App directory: {$appPath} (Permissions: {$appPermissions})");
            
            // Try to check if we can write to the directory
            $testFile = $this->backupDir . '/test_write_' . time() . '.txt';
            if (file_put_contents($testFile, 'test')) {
                $this->info("Successfully wrote test file: {$testFile}");
                unlink($testFile);
                $this->info("Successfully deleted test file");
            } else {
                $this->error("Failed to write test file to: {$this->backupDir}");
            }
        } catch (\Exception $e) {
            $this->error("Error checking environment: " . $e->getMessage());
        }
        
        return 0;
    }
    
    /**
     * Format array of files for display
     */
    protected function formatFiles($files, $useStorage = false)
    {
        $rows = [];
        
        foreach ($files as $file) {
            if ($useStorage) {
                $path = storage_path('app/' . $file);
            } else {
                $path = $file;
            }
            
            if (file_exists($path)) {
                $rows[] = [
                    basename($file),
                    $this->formatSize(filesize($path)),
                    date('Y-m-d H:i:s', filemtime($path))
                ];
            } else {
                $rows[] = [
                    basename($file),
                    'File not found',
                    'N/A'
                ];
            }
        }
        
        return $rows;
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
