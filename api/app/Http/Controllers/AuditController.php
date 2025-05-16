<?php

namespace App\Http\Controllers;

use App\Models\Audit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuditController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $audits = Audit::with('admin')->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $audits
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $audit = Audit::with('admin')->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $audit
        ]);
    }

    /**
     * Filter audits by different criteria.
     */
    public function filter(Request $request)
    {
        $query = Audit::with('admin');
        
        // Filter by action
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }
        
        // Filter by table
        if ($request->has('table_name')) {
            $query->where('table_name', $request->table_name);
        }
        
        // Filter by admin_id
        if ($request->has('admin_id')) {
            $query->where('admin_id', $request->admin_id);
        }
        
        // Filter by start date
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        
        // Filter by end date
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        
        // Sort by date (most recent first by default)
        $query->orderBy('created_at', $request->input('order', 'desc'));
        
        // Paginate results
        $perPage = $request->input('per_page', 15);
        $audits = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $audits
        ]);
    }

    /**
     * Register an audit event.
     * 
     * @param string $action The action performed (create, update, delete)
     * @param string $tableName The table name
     * @param int $recordId The ID of the affected record
     * @param array $oldValues The old values (before change)
     * @param array $newValues The new values (after change)
     * @return Audit
     */
    public static function registerAudit($action, $tableName, $recordId = null, $oldValues = null, $newValues = null)
    {
        // Need to import Auth at the beginning of the static method
        $admin = \Illuminate\Support\Facades\Auth::user();
        
        // If no user is authenticated or user is not an admin
        if (!$admin || !($admin instanceof \App\Models\Admin)) {
            // In development environment, we can use the first admin for testing
            if (app()->environment('local') || app()->environment('development')) {
                $admin = \App\Models\Admin::first();
                if (!$admin) {
                    return null; // No administrators in the database
                }
            } else {
                return null; // In production, don't register without authenticated admin
            }
        }
        
        return Audit::create([
            'admin_id' => $admin->id,
            'action' => $action,
            'table_name' => $tableName,
            'record_id' => $recordId,
            'old_values' => $oldValues ? json_encode($oldValues) : null,
            'new_values' => $newValues ? json_encode($newValues) : null,
        ]);
    }
}
