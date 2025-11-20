<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AgencyController;
use App\Http\Controllers\Api\CountryController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\InscriptionController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\StorageController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Routes publiques
Route::get('/agency', [AgencyController::class, 'show']);
Route::get('/countries', [CountryController::class, 'index']);
Route::get('/news', [NewsController::class, 'index']);
// Route publique pour les avis approuvés uniquement
Route::get('/reviews', [ReviewController::class, 'index']);
// Route publique pour récupérer les paramètres
Route::get('/settings', [SettingsController::class, 'index']);
Route::get('/settings/{key}', [SettingsController::class, 'show']);
// Route publique pour les statistiques
Route::get('/stats', [UserController::class, 'stats']);

// Route publique pour servir les fichiers du storage via API
// Permet d'accéder aux images même si le backend n'est pas accessible directement
Route::get('/storage/{path}', [StorageController::class, 'serve'])->where('path', '.*');

// Authentification
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Inscriptions
    Route::apiResource('inscriptions', InscriptionController::class);
    Route::patch('/inscriptions/{inscription}/status', [InscriptionController::class, 'updateStatus']);
    Route::post('/inscriptions/{inscription}/notify-client', [InscriptionController::class, 'notifyClient'])->middleware('admin');

    // Documents
    Route::apiResource('documents', DocumentController::class);
    Route::get('/documents/{document}/download', [DocumentController::class, 'download']);

    // Messages
    Route::get('/messages/conversations', [MessageController::class, 'conversations']);
    Route::get('/messages/{user?}', [MessageController::class, 'messages']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::get('/messages/unread/count', [MessageController::class, 'unreadCount']);

    // Actualités (Admin)
    Route::get('/news/{news}', [NewsController::class, 'show'])->middleware('admin');
    Route::post('/news', [NewsController::class, 'store'])->middleware('admin');
    Route::match(['put', 'post'], '/news/{news}', [NewsController::class, 'update'])->middleware('admin');
    Route::delete('/news/{news}', [NewsController::class, 'destroy'])->middleware('admin');

    // Avis
    Route::post('/reviews', [ReviewController::class, 'store']);
    // Route pour les admins pour voir tous les avis (y compris pending)
    Route::get('/reviews/all', [ReviewController::class, 'index'])->middleware('admin');
    Route::patch('/reviews/{review}/status', [ReviewController::class, 'updateStatus'])->middleware('admin');
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->middleware('admin');

    // Pays (Admin)
    // IMPORTANT: /countries/all doit être défini AVANT /countries/{country} pour éviter les conflits de routage
    Route::get('/countries/all', [CountryController::class, 'index'])->middleware('admin');
    Route::get('/countries/{country}', [CountryController::class, 'show']);
    Route::post('/countries', [CountryController::class, 'store'])->middleware('admin');
    Route::match(['put', 'post'], '/countries/{country}', [CountryController::class, 'update'])->middleware('admin');
    Route::delete('/countries/{country}', [CountryController::class, 'destroy'])->middleware('admin');

    // Agence (Admin)
    // Accepter à la fois PUT et POST (avec _method=PUT) pour FormData
    Route::match(['put', 'post'], '/agency', [AgencyController::class, 'update'])->middleware('admin');

    // Utilisateurs (Admin)
    Route::get('/users/search', [UserController::class, 'search'])->middleware('admin');
    Route::apiResource('users', UserController::class)->middleware('admin');

    // Paramètres (Admin)
    Route::put('/settings/{key}', [SettingsController::class, 'update'])->middleware('admin');
    Route::post('/settings/multiple', [SettingsController::class, 'updateMultiple'])->middleware('admin');
});


