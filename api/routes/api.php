<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SpaceController;
use App\Http\Controllers\BookingController;
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

Route::get('bookings', [BookingController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', function (Request $request) {
        return $request->user();
    });

    Route::post('logout', [AuthController::class, 'logout']);

    // Routes for spaces

    // Routes for services
    // Routes for reservations
    Route::get('getupcominbookings', [BookingController::class, 'upcomingBookings']);
    Route::get('getpastbookings', [BookingController::class, 'pastBookings']);
    Route::post('bookings/create', [BookingController::class, 'store']);
    Route::get('bookings/{id}', [BookingController::class, 'show']);
    Route::put('bookings/{id}', [BookingController::class, 'update']);
    Route::delete('bookings/{id}', [BookingController::class, 'destroy']);
    Route::get('my-bookings', [BookingController::class, 'userBookings']);

    Route::delete('users/{id}', [UserController::class, 'destroy']);

    // Protected routes for contacts (only GET)
    Route::get('contacts', [ContactController::class, 'index']);
    Route::put('users/{id}', [UserController::class, 'update']);

    Route::post('users/{id}/updateImage', [UserController::class, 'updateImage']); // Route to update user image
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
