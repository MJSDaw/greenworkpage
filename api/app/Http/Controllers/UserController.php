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
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::all();
        return response()->json($users);
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
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users',
                'unique:admins',
            ],
            'dni' => [
                'required',
                'string',
                'max:20',
                Rule::unique('users')->ignore($user->id)
            ],
            'password' => 'nullable|string|min:8',
        ], [
            'email.unique' => 'Email address already in use.',
            'dni.unique' => 'ID number already in use.'
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
