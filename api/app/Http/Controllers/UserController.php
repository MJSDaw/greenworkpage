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
        
        // Guardar los valores originales para la auditoría
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
            'email.unique' => 'El correo electrónico ya está en uso.',
            'dni.unique' => 'El DNI ya está en uso.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
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
        
        // Registrar la acción en la auditoría
        AuditController::registerAudit(
            'update',
            'users',
            $user->id,
            $originalUser,
            $user->toArray()
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Usuario actualizado correctamente',
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
        
        // Registrar la acción en la auditoría
        AuditController::registerAudit(
            'delete',
            'users',
            $id,
            $user->toArray(),
            null
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Usuario eliminado correctamente'
        ]);
    }
}
