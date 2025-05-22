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
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ServiceController;

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

// Public routes for services
Route::get('services', [ServiceController::class, 'index']);

// Public routes for spaces
Route::get('spaces', [SpaceController::class, 'index']);
Route::get('spaces/{id}', [SpaceController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('logout', [AuthController::class, 'logout']);
    
    // Routes for spaces
    
    // Routes for services
    // Routes for reservations
    Route::get('getactivebookings', [ReservationController::class, 'getActiveReservations']);
    Route::get('getinactivebookings', [ReservationController::class, 'getInactiveReservations']);
    Route::post('bookings/create', [ReservationController::class, 'store']);
    Route::get('bookings/{id}', [ReservationController::class, 'show']);
    Route::put('bookings/{id}', [ReservationController::class, 'update']);
    Route::delete('bookings/{id}', [ReservationController::class, 'destroy']);
    Route::get('my-bookings', [ReservationController::class, 'myReservations']);
    Route::get('spaces/{spaceId}/bookings', [ReservationController::class, 'spaceReservations']);
    Route::delete('users/{id}', [UserController::class, 'destroy']);
    
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
    Route::put('users/{id}', [UserController::class, 'update']); // Route to update a specific user
    
    // Routes for spaces
    Route::apiResource('spaces', SpaceController::class);
    Route::delete('spaces/{id}', [SpaceController::class, 'destroy']);
    
    // Routes for audits
    Route::get('audits', [AuditController::class, 'index']);
    Route::get('audits/filter', [AuditController::class, 'filter']);
    Route::get('audits/{id}', [AuditController::class, 'show']);
    
    // Route for database backup
    Route::post('backup', [AdminController::class, 'createBackup']);
    
    // Routes for payments
    Route::get('payments/pending', [PaymentController::class, 'getPendingPayments']);
    Route::get('payments/completed', [PaymentController::class, 'getCompletedPayments']);
    Route::post('payments', [PaymentController::class, 'store']);
    Route::put('payments/{id}', [PaymentController::class, 'update']);
    
    // Admin routes for services
    Route::post('services', [ServiceController::class, 'store']);
    Route::put('services/{id}', [ServiceController::class, 'update']);
    Route::delete('services/{id}', [ServiceController::class, 'destroy']);
});
