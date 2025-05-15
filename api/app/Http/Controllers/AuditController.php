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
        
        // Filtrar por acción
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }
        
        // Filtrar por tabla
        if ($request->has('table_name')) {
            $query->where('table_name', $request->table_name);
        }
        
        // Filtrar por admin_id
        if ($request->has('admin_id')) {
            $query->where('admin_id', $request->admin_id);
        }
        
        // Filtrar por fecha de inicio
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        
        // Filtrar por fecha de fin
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        
        // Ordenar por fecha (más reciente primero por defecto)
        $query->orderBy('created_at', $request->input('order', 'desc'));
        
        // Paginar los resultados
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
        // Necesitamos importar Auth al inicio del método estático
        $admin = \Illuminate\Support\Facades\Auth::user();
        
        // Si no hay usuario autenticado o no es un administrador
        if (!$admin || !($admin instanceof \App\Models\Admin)) {
            // En entorno de desarrollo, podemos usar el primer admin para pruebas
            if (app()->environment('local') || app()->environment('development')) {
                $admin = \App\Models\Admin::first();
                if (!$admin) {
                    return null; // No hay administradores en la base de datos
                }
            } else {
                return null; // En producción, no registrar sin admin autenticado
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

