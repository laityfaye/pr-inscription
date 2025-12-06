<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AgencyUpdateRequest;
use App\Models\AgencySetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class AgencyController extends Controller
{
    public function show(): JsonResponse
    {
        $settings = AgencySetting::getSettings();

        return response()->json($settings);
    }

    public function update(AgencyUpdateRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $settings = AgencySetting::getSettings();
            
            // Valider manuellement les emails s'ils sont présents
            if (!empty($validated['email']) && !filter_var($validated['email'], FILTER_VALIDATE_EMAIL)) {
                return response()->json([
                    'message' => 'Erreur de validation',
                    'errors' => ['email' => ['L\'email doit être une adresse email valide.']],
                ], 422);
            }
            
            if (!empty($validated['lawyer_email']) && !filter_var($validated['lawyer_email'], FILTER_VALIDATE_EMAIL)) {
                return response()->json([
                    'message' => 'Erreur de validation',
                    'errors' => ['lawyer_email' => ['L\'email de l\'avocat doit être une adresse email valide.']],
                ], 422);
            }
            
            // Préparer les données à mettre à jour (conserver les valeurs booléennes false)
            $updateData = [];
            foreach ($validated as $key => $value) {
                if ($value !== null || is_bool($value)) {
                    $updateData[$key] = $value;
                }
            }
            
            // S'assurer que lawyer_card_enabled est dans les données
            if (isset($validated['lawyer_card_enabled'])) {
                $updateData['lawyer_card_enabled'] = $validated['lawyer_card_enabled'];
            } else {
                $updateData['lawyer_card_enabled'] = false;
            }
            
            // Traiter le logo séparément
            if ($request->hasFile('logo')) {
                if ($settings->logo) {
                    Storage::disk('public')->delete($settings->logo);
                }
                $updateData['logo'] = $request->file('logo')->store('agency', 'public');
            }

            // Traiter l'image de l'avocat séparément
            if ($request->hasFile('lawyer_image')) {
                if ($settings->lawyer_image) {
                    Storage::disk('public')->delete($settings->lawyer_image);
                }
                $updateData['lawyer_image'] = $request->file('lawyer_image')->store('agency', 'public');
            }


            // Mettre à jour les champs
            if (!empty($updateData)) {
                $settings->fill($updateData);
                $settings->save();
            }

            return response()->json($settings->fresh())->header('Cache-Control', 'no-cache, no-store, must-revalidate');
        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour de l\'agence:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'message' => 'Une erreur est survenue lors de la mise à jour',
                'error' => config('app.debug') ? $e->getMessage() : 'Erreur interne du serveur',
            ], 500);
        }
    }
}

