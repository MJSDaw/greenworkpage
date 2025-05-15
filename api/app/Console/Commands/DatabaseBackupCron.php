<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class DatabaseBackupCron extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:backup:cron';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run database backup via cron';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Create both backup directories if they don't exist
        $backupDirs = [
            storage_path('app/backups'),
            base_path('../backups')
        ];
        
        foreach ($backupDirs as $backupDir) {
            if (!file_exists($backupDir)) {
                if (mkdir($backupDir, 0755, true)) {
                    $this->info("Created backup directory: {$backupDir}");
                } else {
                    $this->warn("Failed to create backup directory: {$backupDir}");
                }
            }
        }
        
        // Run the db:backup command
        $this->info('Running database backup via cron...');
        $this->call('db:backup');
        
        $this->info('Database backup via cron completed.');
        Log::info('Database backup via cron completed successfully.');
    }
}
