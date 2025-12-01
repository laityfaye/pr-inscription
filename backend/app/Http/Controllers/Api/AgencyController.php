<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

    public function update(Request $request): JsonResponse
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'name' => ['nullable', 'string'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'description' => ['nullable', 'string'],
            'hero_subtitle' => ['nullable', 'string'],
            'email' => ['nullable', 'email'],
            'whatsapp' => ['nullable', 'string'],
            'phone' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
            'registration_number' => ['nullable', 'string'],
            'lawyer_card_enabled' => ['nullable', 'in:true,false,1,0,"true","false","1","0"'],
            'lawyer_first_name' => ['nullable', 'string'],
            'lawyer_last_name' => ['nullable', 'string'],
            'lawyer_title' => ['nullable', 'string'],
            'lawyer_image' => ['nullable', 'image', 'max:2048'],
            'lawyer_phone' => ['nullable', 'string'],
            'lawyer_email' => ['nullable', 'email'],
        ]);

        $settings = AgencySetting::getSettings();
        
        // Préparer les données à mettre à jour
        $updateData = [];
        
        // Traiter chaque champ individuellement
        // IMPORTANT: Avec FormData en PUT, Laravel ne parse pas toujours correctement
        // Utiliser input() pour chaque champ au lieu de all()
        $fields = ['name', 'description', 'hero_subtitle', 'email', 'whatsapp', 'phone', 'address', 'registration_number', 'lawyer_first_name', 'lawyer_last_name', 'lawyer_title', 'lawyer_phone', 'lawyer_email'];
        
        foreach ($fields as $field) {
            // Vérifier si le champ existe dans la requête avec input() qui fonctionne mieux avec FormData
            if ($request->exists($field)) {
                $value = $request->input($field);
                // Log pour debug
                Log::info("Champ {$field} reçu:", ['value' => $value, 'type' => gettype($value)]);
                // Traiter les valeurs : convertir chaînes vides en null pour les champs nullable
                if ($value === '' || $value === null) {
                    $updateData[$field] = null;
                } else {
                    $updateData[$field] = $value;
                }
            } else {
                // Si le champ n'existe pas, essayer avec has()
                if ($request->has($field)) {
                    $value = $request->input($field);
                    Log::info("Champ {$field} trouvé avec has():", ['value' => $value]);
                    $updateData[$field] = $value === '' || $value === null ? null : $value;
                }
            }
        }
        
        // Log pour debug
        Log::info('Données brutes reçues (all):', $request->all());
        Log::info('Données brutes reçues (input):', $request->input());
        Log::info('Données à mettre à jour:', $updateData);

        // Traiter le logo séparément (ne pas le mettre dans le tableau si pas de fichier)
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

        // Traiter lawyer_card_enabled (peut être une string "true"/"false" depuis FormData)
        if ($request->has('lawyer_card_enabled')) {
            $value = $request->input('lawyer_card_enabled');
            // Convertir différentes représentations en booléen
            if (is_string($value)) {
                $updateData['lawyer_card_enabled'] = in_array(strtolower($value), ['true', '1', 'on', 'yes'], true);
            } else {
                $updateData['lawyer_card_enabled'] = (bool) $value;
            }
        } else {
            // Si le champ n'est pas présent dans la requête, c'est qu'il est désactivé
            $updateData['lawyer_card_enabled'] = false;
        }

        // Log pour debug
        Log::info('Données à mettre à jour:', $updateData);

        // Mettre à jour les champs seulement si on a des données
        if (!empty($updateData)) {
            $settings->fill($updateData);
            $settings->save();
            
            // Log pour vérifier la sauvegarde
            Log::info('Paramètres sauvegardés:', $settings->toArray());
        }

        // Recharger depuis la base de données pour obtenir les données à jour
        $settings->refresh();
        
        return response()->json($settings->fresh())->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
}

