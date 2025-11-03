<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\WarehouseController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Middleware\CheckPermission;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Users management
    Route::apiResource('users', UserController::class);
    
    // Roles & Permissions
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('permissions', PermissionController::class);
    
    // Inventory routes
    Route::get('inventory', [InventoryController::class, 'index']);
    Route::get('transactions', [TransactionController::class, 'index']);
    Route::post('transactions', [TransactionController::class, 'store']);
    
    // Warehouses
    Route::apiResource('warehouses', WarehouseController::class);
    
    // Teams
    Route::apiResource('teams', TeamController::class);
    
    // Products
    Route::apiResource('products', ProductController::class);
    Route::get('products/search/by-code', [ProductController::class, 'searchByCode']);
});

