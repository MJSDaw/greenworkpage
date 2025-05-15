<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;


class AuthController extends Controller
{
    /**
     * Registrar un nuevo usuario
     */
    public function register(Request $request)
    {
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
            'dni' => 'required|string|max:20|unique:users',
            'birthdate' => 'required|date|date_format:Y-m-d|before_or_equal:' . now()->subYears(13)->format('Y-m-d'),
            'password' => [
                'required', 
                'string',
                Password::min(8),
            ],
            'password_confirm' => 'required|same:password',
            'termsAndConditions' => 'required|boolean|accepted',
        ], [
            'password_confirm.same' => 'La confirmación de contraseña no coincide con la contraseña ingresada.',
            'email.format' => 'El correo electrónico debe tener un formato válido.',
            'email.unique' => 'El correo electrónico ya está en uso.',
            'dni.unique' => 'El DNI ya está en uso.',
            'birthdate.required' => 'Birth date is required.',
            'birthdate.date' => 'Birth date must be a valid date.',
            'birthdate.date_format' => 'Birth date must be in YYYY-MM-DD format.',
            'birthdate.before_or_equal' => 'You must be at least 13 years old to register.',
            'termsAndConditions.required' => 'You must accept the terms and conditions.',
            'termsAndConditions.accepted' => 'You must accept the terms and conditions.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'surname' => $request->surname,
            'email' => $request->email,
            'dni' => $request->dni,
            'birthdate' => $request->birthdate,
            'password' => Hash::make($request->password),
            'termsAndConditions' => $request->termsAndConditions,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    /**
     * Iniciar sesión de usuario
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Revocar tokens anteriores
        $user->tokens()->delete();

        // Crear nuevo token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ]);
    }

    /**
     * Iniciar sesión de administrador
     */
    public function adminLogin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $admin = \App\Models\Admin::where('email', $request->email)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid admin credentials'
            ], 401);
        }

        // Revocar tokens anteriores
        $admin->tokens()->delete();

        // Crear nuevo token con guard de admin
        $token = $admin->createToken('admin_token', ['admin'])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Admin login successful',
            'user' => $admin,
            'token' => $token
        ]);
    }

    /**
     * Cerrar sesión
     */
    public function logout(Request $request)
    {
        // Revocar el token actual
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }
}
