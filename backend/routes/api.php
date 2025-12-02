<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AgencyController;
use App\Http\Controllers\Api\CountryController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\InscriptionController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\ResidenceApplicationController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\StorageController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WorkPermitApplicationController;
use App\Http\Controllers\Api\WorkPermitCountryController;
use App\Http\Controllers\Api\AppointmentController;
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

// Routes publiques pour les rendez-vous
Route::get('/appointments/booked-slots', [AppointmentController::class, 'getBookedSlots']);
Route::get('/appointments/unavailable-days', [AppointmentController::class, 'getUnavailableDays']);
Route::get('/appointments/slot-prices', [AppointmentController::class, 'getSlotPrices']);

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
    // Routes spécifiques doivent être définies AVANT apiResource pour éviter les conflits
    Route::get('/documents/{document}/view', [DocumentController::class, 'view']);
    Route::get('/documents/{document}/download', [DocumentController::class, 'download']);
    Route::post('/documents/{document}/approve', [DocumentController::class, 'approve'])->middleware('admin');
    Route::post('/documents/{document}/reject', [DocumentController::class, 'reject'])->middleware('admin');
    // Exclure 'update' car nous n'utilisons pas cette méthode
    Route::apiResource('documents', DocumentController::class)->except(['update']);

    // Messages
    Route::get('/messages/conversations', [MessageController::class, 'conversations']);
    Route::get('/messages/{user?}', [MessageController::class, 'messages']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::get('/messages/unread/count', [MessageController::class, 'unreadCount']);
    Route::get('/messages/{message}/download', [MessageController::class, 'downloadFile']);

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

    // Pays de permis de travail
    Route::get('/work-permit-countries/all', [WorkPermitCountryController::class, 'index'])->middleware('admin');
    Route::get('/work-permit-countries', [WorkPermitCountryController::class, 'index']);
    Route::get('/work-permit-countries/{workPermitCountry}', [WorkPermitCountryController::class, 'show']);
    Route::post('/work-permit-countries', [WorkPermitCountryController::class, 'store'])->middleware('admin');
    Route::match(['put', 'post'], '/work-permit-countries/{workPermitCountry}', [WorkPermitCountryController::class, 'update'])->middleware('admin');
    Route::delete('/work-permit-countries/{workPermitCountry}', [WorkPermitCountryController::class, 'destroy'])->middleware('admin');

    // Demandes de permis de travail
    Route::apiResource('work-permit-applications', WorkPermitApplicationController::class);
    Route::patch('/work-permit-applications/{workPermitApplication}/status', [WorkPermitApplicationController::class, 'updateStatus'])->middleware('admin');
    Route::post('/work-permit-applications/{workPermitApplication}/notify-client', [WorkPermitApplicationController::class, 'notifyClient'])->middleware('admin');

    // Demandes de résidence
    Route::apiResource('residence-applications', ResidenceApplicationController::class);
    Route::patch('/residence-applications/{residenceApplication}/status', [ResidenceApplicationController::class, 'updateStatus'])->middleware('admin');
    Route::post('/residence-applications/{residenceApplication}/notify-client', [ResidenceApplicationController::class, 'notifyClient'])->middleware('admin');

    // Rendez-vous
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments', [AppointmentController::class, 'index'])->middleware('admin');
    Route::get('/appointments/{appointment}', [AppointmentController::class, 'show'])->middleware('admin');
    Route::post('/appointments/{appointment}/validate', [AppointmentController::class, 'validateAppointment'])->middleware('admin');
    Route::post('/appointments/{appointment}/reject', [AppointmentController::class, 'reject'])->middleware('admin');
    Route::post('/appointments/unavailable-days', [AppointmentController::class, 'addUnavailableDay'])->middleware('admin');
    Route::delete('/appointments/unavailable-days/{date}', [AppointmentController::class, 'removeUnavailableDay'])->middleware('admin');
    Route::post('/appointments/slot-prices', [AppointmentController::class, 'updateSlotPrice'])->middleware('admin');
});


