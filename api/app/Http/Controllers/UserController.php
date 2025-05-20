<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Http\Controllers\AuditController;

class UserController extends Controller
{
    /**
     * Display a listing of the resource with filtering and ordering.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = User::query();
        
        // Filter by name
        if ($request->has('name')) {
            $query->filterByName($request->name);
        }
        
        // Filter by surname
        if ($request->has('surname')) {
            $query->filterBySurname($request->surname);
        }
        
        // Filter by email
        if ($request->has('email')) {
            $query->filterByEmail($request->email);
        }
        
        // Filter by birthdate range
        if ($request->has('birthdate_from') || $request->has('birthdate_to')) {
            $query->filterByBirthdateRange($request->birthdate_from, $request->birthdate_to);
        }
        
        // Filter by registration date range
        if ($request->has('registered_from') || $request->has('registered_to')) {
            $query->filterByRegistrationDateRange($request->registered_from, $request->registered_to);
        }
        
        // Search by any field
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('surname', 'like', '%' . $searchTerm . '%')
                  ->orWhere('email', 'like', '%' . $searchTerm . '%');
            });
        }
        
        // Ordering
        $orderBy = $request->input('order_by', 'created_at');
        $direction = $request->input('direction', 'desc');
        
        // Validate order_by to prevent SQL injection
        $allowedOrderColumns = [
            'id', 'name', 'surname', 'email', 'birthdate', 'created_at', 'updated_at'
        ];
        
        if (!in_array($orderBy, $allowedOrderColumns)) {
            $orderBy = 'created_at';
        }
        
        // Validate order direction
        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';
        
        // Apply ordering
        $query->orderBy($orderBy, $direction);
        
        // Pagination
        $perPage = $request->input('per_page', 15);
        $users = $query->paginate($perPage);
        
        return response()->json($users);
    }

    /**
     * Filter users by various criteria.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function filter(Request $request)
    {
        return $this->index($request);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        
        // Save original values for audit
        $originalUser = $user->toArray();
        
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'surname' => 'string|max:255',
            'email' => [
                'string',
                'email',
                'max:255',
                'unique:users',
                'unique:admins',
            ],
            'password' => 'nullable|string|min:8',
        ], [
            'email.unique' => 'Email address already in use.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->name = $request->name;
        $user->surname = $request->surname;
        $user->email = $request->email;
        $user->dni = $request->dni;
        
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }
        
        $user->save();
        
        // Register the action in the audit
        AuditController::registerAudit(
            'update',
            'users',
            $user->id,
            $originalUser,
            $user->toArray()
        );
        
        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        
        // Register the action in the audit
        AuditController::registerAudit(
            'delete',
            'users',
            $id,
            $user->toArray(),
            null
        );
        
        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }
}
