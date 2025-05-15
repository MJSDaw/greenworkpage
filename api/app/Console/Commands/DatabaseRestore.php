<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class DatabaseRestore extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:restore {filename? : The name of the backup file to restore}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Restore the database from a backup file';

    /**
     * The backup directory paths
     * 
     * @var array
     */
    protected $backupDirs = [
        '/var/www/html/storage/app/backups',
        '/var/www/html/backups'
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Get the backup file name from the command argument or list available backups
        $filename = $this->argument('filename');
        
        if (!$filename) {
            $this->listAvailableBackups();
            $filename = $this->ask('Enter the backup file name to restore:');
        }
        
        // Find the backup file in any of the possible directories
        $backupPath = null;
        foreach ($this->backupDirs as $dir) {
            $path = $dir . '/' . $filename;
            if (file_exists($path)) {
                $backupPath = $path;
                break;
            }
        }
        
        // If not found, try to use the filename directly as it might be a full path
        if (!$backupPath && file_exists($filename)) {
            $backupPath = $filename;
        }
        
        if (!$backupPath) {
            $this->error("Backup file not found: {$filename}");
            $this->info("Directories checked:");
            foreach ($this->backupDirs as $dir) {
                $this->info("- {$dir}" . (file_exists($dir) ? ' (exists)' : ' (not found)'));
            }
            return 1;
        }

        // Get database configuration
        $dbHost = config('database.connections.pgsql.host');
        $dbPort = config('database.connections.pgsql.port');
        $dbName = config('database.connections.pgsql.database');
        $dbUsername = config('database.connections.pgsql.username');
        $dbPassword = config('database.connections.pgsql.password');
        
        // Confirm before proceeding
        if (!$this->confirm("This will overwrite the current database ({$dbName}) with the backup from {$filename}. Are you sure you want to continue?", false)) {
            $this->info('Restore operation cancelled.');
            return 0;
        }
        
        // Command to restore backup
        $command = "PGPASSWORD={$dbPassword} psql -h {$dbHost} -p {$dbPort} -U {$dbUsername} -d {$dbName} -f {$backupPath}";
        
        try {
            // Execute restore command
            $this->info('Database restore in progress...');
            exec($command, $output, $returnVar);
            
            if ($returnVar === 0) {
                $this->info('Database restore completed successfully.');
                Log::info("Database restored successfully from file: {$filename}");
            } else {
                $this->error('Database restore failed.');
                $this->error(implode("\n", $output));
                Log::error("Database restore failed with error code: {$returnVar}");
            }
        } catch (\Exception $e) {
            $this->error("An error occurred during restore: {$e->getMessage()}");
            Log::error("Restore error: {$e->getMessage()}");
            return 1;
        }
        
        return 0;
    }

    /**
     * List all available backup files
     */
    protected function listAvailableBackups()
    {
        $allFiles = [];
        
        // Check all possible backup directories
        foreach ($this->backupDirs as $dir) {
            if (file_exists($dir)) {
                $files = glob($dir . '/*.sql');
                $allFiles = array_merge($allFiles, $files);
            }
        }
        
        if (count($allFiles) === 0) {
            $this->info('No backup files found.');
            $this->info('Directories checked:');
            foreach ($this->backupDirs as $dir) {
                $this->info("- {$dir}" . (file_exists($dir) ? ' (exists)' : ' (not found)'));
            }
            return;
        }
        
        $this->info('Available backup files:');
        
        $headers = ['Filename', 'Size', 'Last Modified', 'Location'];
        $rows = [];
        
        foreach ($allFiles as $file) {
            $rows[] = [
                basename($file),
                $this->formatSize(filesize($file)),
                date('Y-m-d H:i:s', filemtime($file)),
                dirname($file)
            ];
        }
        
        $this->table($headers, $rows);
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
