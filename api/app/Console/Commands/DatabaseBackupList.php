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
     * The backup directory paths
     * 
     * @var array
     */
    protected $backupDirs = [
        '/var/www/html/storage/app/backups',  // Inside container storage
        '/var/www/html/backups'               // Project root backups folder
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for database backups...');
        
        $totalBackups = 0;
        $allFiles = [];
        
        // Check all backup directories
        foreach ($this->backupDirs as $dir) {
            // Check directory exists
            if (file_exists($dir)) {
                $backupFiles = glob($dir . '/*.sql');
                $count = count($backupFiles);
                $totalBackups += $count;
                
                $this->info("Directory: {$dir}");
                if ($count > 0) {
                    $this->info('Found ' . $count . ' backup files:');
                    $rows = [];
                    foreach ($backupFiles as $file) {
                        $rows[] = [
                            basename($file),
                            $this->formatSize(filesize($file)),
                            date('Y-m-d H:i:s', filemtime($file)),
                            $dir
                        ];
                        
                        // Add to all files array for consolidation
                        $allFiles[] = $file;
                    }
                    $this->table(['Filename', 'Size', 'Last Modified', 'Location'], $rows);
                } else {
                    $this->warn('No backup files found in this directory.');
                }
            } else {
                $this->warn('Backup directory does not exist: ' . $dir);
                
                // Try to create it
                if (mkdir($dir, 0755, true)) {
                    $this->info('Created backup directory: ' . $dir);
                } else {
                    $this->error('Failed to create backup directory: ' . $dir);
                }
            }
        }
        
        // Show consolidated list if backups found in multiple directories
        if ($totalBackups > 0 && count($this->backupDirs) > 1) {
            $this->info('=============================');
            $this->info('Consolidated backup list: ' . $totalBackups . ' total backup(s)');
            
            // Group duplicate backups (same filename in different directories)
            $groupedFiles = [];
            foreach ($allFiles as $file) {
                $basename = basename($file);
                if (!isset($groupedFiles[$basename])) {
                    $groupedFiles[$basename] = [];
                }
                $groupedFiles[$basename][] = $file;
            }
            
            $consolidatedRows = [];
            foreach ($groupedFiles as $filename => $locations) {
                $consolidatedRows[] = [
                    $filename,
                    $this->formatSize(filesize($locations[0])),
                    date('Y-m-d H:i:s', filemtime($locations[0])),
                    count($locations) > 1 ? 'Multiple locations (' . count($locations) . ')' : dirname($locations[0])
                ];
            }
            
            $this->table(['Filename', 'Size', 'Last Modified', 'Location'], $consolidatedRows);
        } elseif ($totalBackups == 0) {
            $this->error('No backup files found in any directory.');
        }
        
        // Check Docker permissions
        $this->info('=============================');
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
            
            // Try to check if we can write to each directory
            foreach ($this->backupDirs as $dir) {
                if (file_exists($dir)) {
                    $testFile = $dir . '/test_write_' . time() . '.txt';
                    if (file_put_contents($testFile, 'test')) {
                        $this->info("Successfully wrote test file to: {$dir}");
                        unlink($testFile);
                        $this->info("Successfully deleted test file from: {$dir}");
                    } else {
                        $this->error("Failed to write test file to: {$dir}");
                    }
                } else {
                    $this->warn("Cannot test write permissions - directory does not exist: {$dir}");
                }
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
