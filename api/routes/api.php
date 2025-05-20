<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SpaceController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\AuditController;

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

// Public authentication routes
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('admin/login', [AuthController::class, 'adminLogin']);

// Public routes for contacts
Route::post('contacts', [ContactController::class, 'store']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('logout', [AuthController::class, 'logout']);

    // Routes for spaces
    Route::get('spaces', [SpaceController::class, 'index']);
    
    // Routes for reservations
    Route::get('reservations', [ReservationController::class, 'index']);
    Route::post('reservations', [ReservationController::class, 'store']);
    Route::get('my-reservations', [ReservationController::class, 'myReservations']);
    Route::get('spaces/{spaceId}/reservations', [ReservationController::class, 'spaceReservations']);
    
    // Protected routes for contacts (only GET)
    Route::get('contacts', [ContactController::class, 'index']);
});


// Routes for administrators (protected and admin-only)
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::apiResource('admins', AdminController::class);
    Route::post('{id}/updateImage', [AdminController::class, 'updateImage']); // Route to update admin image
    Route::get('users', [UserController::class, 'index']); // Route to get all users
    Route::get('users/filter', [UserController::class, 'filter']); // Route to filter users
    Route::get('users/{id}', [UserController::class, 'show']); // Route to get a specific user
    
    // Routes for spaces
    Route::apiResource('spaces', SpaceController::class);
    
    // Routes for audits
    Route::get('audits', [AuditController::class, 'index']);
    Route::get('audits/filter', [AuditController::class, 'filter']);
    Route::get('audits/{id}', [AuditController::class, 'show']);
});
