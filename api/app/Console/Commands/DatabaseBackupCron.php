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
        // Create backup directory if it doesn't exist
        $backupDir = storage_path('app/backups');
        if (!file_exists($backupDir)) {
            mkdir($backupDir, 0755, true);
        }
        
        // Run the db:backup command
        $this->info('Running database backup via cron...');
        $this->call('db:backup');
        
        $this->info('Database backup via cron completed.');
        Log::info('Database backup via cron completed successfully.');
    }
}
