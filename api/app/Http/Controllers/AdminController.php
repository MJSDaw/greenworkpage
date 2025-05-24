<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\AuditController;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    /**
     * Update admin profile image
     *
     * @param Request $request
     * @param int $id Admin ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateImage(Request $request, $id)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:webp,jpeg,png,jpg,svg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Find the admin
            $admin = Admin::findOrFail($id);
            
            // Delete old image if exists
            if ($admin->image && Storage::disk('public')->exists($admin->image)) {
                Storage::disk('public')->delete($admin->image);
            }
            
            // Store the new image
            $image = $request->file('image');
            $path = $image->store('admin-images', 'public');
            
            // Update admin record
            $admin->image = $path;
            $admin->save();
            
            // Create audit record if AuditController exists
            try {
                app(AuditController::class)->store([
                    'admin_id' => auth()->guard('admin')->id(),
                    'action' => 'update',
                    'table_name' => 'admins',
                    'record_id' => $admin->id,
                    'old_values' => json_encode(['image' => $admin->getOriginal('image')]),
                    'new_values' => json_encode(['image' => $path]),
                ]);
            } catch (\Exception $e) {
                // Log the error but don't fail the request
                \Log::error('Failed to create audit record: ' . $e->getMessage());
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Admin image updated successfully',
                'data' => [
                    'admin' => $admin,
                    'image_url' => Storage::url($path)
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update admin image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a database backup
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createBackup(Request $request)
    {
        try {
            // Get current admin id
            $adminId = auth()->guard('admin')->id();
            
            // Log the start of backup
            \Log::info("Starting database backup initiated by admin ID: " . $adminId);
            
            // Run the backup command
            $exitCode = \Artisan::call('db:backup', [
                '--admin_id' => $adminId
            ]);
            
            $output = \Artisan::output();
            \Log::info("Backup command output: " . $output);
            
            if ($exitCode !== 0) {
                throw new \Exception("Backup command failed: " . $output);
            }
            
            // Create audit record
            try {
                app(AuditController::class)->store([
                    'admin_id' => $adminId,
                    'action' => 'backup',
                    'table_name' => 'database',
                    'record_id' => null,
                    'old_values' => null,
                    'new_values' => json_encode(['timestamp' => date('Y-m-d H:i:s')])
                ]);
            } catch (\Exception $e) {
                \Log::warning("Failed to create audit record for backup: " . $e->getMessage());
            }
            
            // Extract the backup file path from the output
            if (preg_match('/Backup completed successfully: (.+)/', $output, $matches)) {
                $backupFile = $matches[1];
                
                return response()->json([
                    'success' => true,
                    'message' => 'Database backup created successfully',
                    'data' => [
                        'backup_file' => basename($backupFile),
                        'timestamp' => date('Y-m-d H:i:s')
                    ]
                ]);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Database backup created successfully',
                'data' => [
                    'output' => $output
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create database backup',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
