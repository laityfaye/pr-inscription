<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Country;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CountryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Si l'utilisateur est admin et demande tous les pays (y compris inactifs)
        // Vérifier si on est sur la route /countries/all ou si le paramètre all est présent
        $path = $request->path();
        $isAllRoute = strpos($path, 'countries/all') !== false || $request->has('all');
        
        if ($request->user()?->isAdmin() && $isAllRoute) {
            $countries = Country::orderBy('name')->get();
        } else {
            // Sinon, retourner uniquement les pays actifs
            $countries = Country::where('is_active', true)->orderBy('name')->get();
        }

        return response()->json($countries);
    }

    public function show(Country $country): JsonResponse
    {
        return response()->json($country);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'code' => ['required', 'string', 'size:3', 'unique:countries'],
            'description' => ['nullable', 'string'],
            'eligibility_conditions' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $country = Country::create($request->all());

        return response()->json($country, 201);
    }

    public function update(Request $request, Country $country): JsonResponse
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'code' => ['sometimes', 'required', 'string', 'size:3', 'unique:countries,code,' . $country->id],
            'description' => ['nullable', 'string'],
            'eligibility_conditions' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $country->update($request->all());

        return response()->json($country);
    }

    public function destroy(Country $country): JsonResponse
    {
        if (!request()->user()?->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Vérifier s'il y a des inscriptions liées à ce pays
        if ($country->inscriptions()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer ce pays car il est associé à des inscriptions',
            ], 422);
        }

        $country->delete();

        return response()->json(['message' => 'Pays supprimé avec succès']);
    }
}


