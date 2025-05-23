<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Http\Controllers\AuditController;
use Illuminate\Support\Facades\Storage;


class UserController extends Controller
{
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
            // Find the user
            $user = User::findOrFail($id);
            
            // Delete old image if exists
            if ($user->image && Storage::disk('public')->exists($user->image)) {
                Storage::disk('public')->delete($user->image);
            }
            
            // Store the new image
            $image = $request->file('image');
            $path = $image->store('user-images', 'public');
            
            // Update user record
            $user->image = $path;
            $user->save();
            
            // Create audit record if AuditController exists
            try {
                app(AuditController::class)->store([
                    'user_id' => auth()->guard('user')->id(),
                    'action' => 'update',
                    'table_name' => 'users',
                    'record_id' => $user->id,
                    'old_values' => json_encode(['image' => $user->getOriginal('image')]),
                    'new_values' => json_encode(['image' => $path]),
                ]);
            } catch (\Exception $e) {
                // Log the error but don't fail the request
                \Log::error('Failed to create audit record: ' . $e->getMessage());
            }
            
            return response()->json([
                'success' => true,
                'message' => 'User image updated successfully',
                'data' => [
                    'user' => $user,
                    'image_url' => Storage::url($path)
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

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
        
        $rules = [
            'name' => 'sometimes|required|string|max:255',
            'surname' => 'sometimes|required|string|max:255',
            'password' => 'nullable|string|min:8',
        ];

        // Solo validar email si se está actualizando
        if ($request->has('email')) {
            $rules['email'] = [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($id),
                Rule::unique('admins'),
            ];
        }

        $validator = Validator::make($request->all(), $rules, [
            'email.unique' => 'Email address already in use.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Actualizar solo los campos que se han enviado
        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('surname')) {
            $user->surname = $request->surname;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        if ($request->has('dni')) {
            $user->dni = $request->dni;
        }
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
