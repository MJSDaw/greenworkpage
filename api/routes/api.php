<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SpaceController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ContactController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rutas públicas de autenticación
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('logout', [AuthController::class, 'logout']);

    // Rutas para spaces
    Route::get('spaces', [SpaceController::class, 'index']);
    
    // Rutas para reservations
    Route::get('reservations', [ReservationController::class, 'index']);
    Route::post('reservations', [ReservationController::class, 'store']);
    
    // Rutas públicas para contactos
    Route::post('contacts', [ContactController::class, 'store']);
    Route::get('contacts', [ContactController::class, 'index']);
});


// Ruta para administradores (protegida y solo para administradores)
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    Route::apiResource('admins', AdminController::class);
    Route::get('users', [UserController::class, 'index']); // Ruta para obtener todos los usuarios
    Route::post('spaces', [SpaceController::class, 'store']); // Ruta para crear un nuevo espacio
});
