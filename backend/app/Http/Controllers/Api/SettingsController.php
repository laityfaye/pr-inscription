<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * Récupère tous les paramètres
     */
    public function index(): JsonResponse
    {
        $settings = Setting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    /**
     * Récupère un paramètre spécifique
     */
    public function show(string $key): JsonResponse
    {
        $setting = Setting::where('key', $key)->first();
        
        if (!$setting) {
            return response()->json(['value' => null], 200);
        }

        return response()->json(['key' => $setting->key, 'value' => $setting->value]);
    }

    /**
     * Met à jour un paramètre
     */
    public function update(Request $request, string $key): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'value' => ['required', 'string', 'max:500'],
        ]);

        Setting::set($key, $request->value);

        return response()->json([
            'message' => 'Paramètre mis à jour avec succès',
            'key' => $key,
            'value' => $request->value,
        ]);
    }

    /**
     * Met à jour plusieurs paramètres à la fois
     */
    public function updateMultiple(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'settings' => ['required', 'array'],
            'settings.*' => ['string', 'max:500'],
        ]);

        foreach ($request->settings as $key => $value) {
            Setting::set($key, $value);
        }

        return response()->json([
            'message' => 'Paramètres mis à jour avec succès',
        ]);
    }
}
