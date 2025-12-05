<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = null;
        
        try {
            $user = $this->authService->register($request->validated());
            
            // Créer le token
            try {
                $token = $user->createToken('auth-token')->plainTextToken;
            } catch (\Exception $e) {
                Log::error('Erreur lors de la création du token: ' . $e->getMessage(), [
                    'user_id' => $user->id,
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }

            // Recharger l'utilisateur pour éviter les problèmes de sérialisation
            // et s'assurer qu'il n'y a pas de relations chargées
            $user = $user->fresh();
            
            // Sérialiser l'utilisateur manuellement pour éviter les problèmes
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'target_country' => $user->target_country,
                'photo' => $user->photo,
                'created_at' => $user->created_at?->toISOString(),
                'updated_at' => $user->updated_at?->toISOString(),
            ];

            return response()->json([
                'message' => 'Inscription réussie',
                'user' => $userData,
                'token' => $token,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'inscription: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'user_id' => $user?->id
            ]);
            
            // Si l'utilisateur a été créé mais qu'il y a eu une erreur après,
            // on ne le supprime pas car il pourrait être utile pour le débogage
            // et l'utilisateur pourra se connecter avec ses identifiants
            
            return response()->json([
                'message' => 'Erreur lors de l\'inscription',
                'error' => config('app.debug') ? $e->getMessage() : 'Une erreur est survenue lors de l\'inscription',
            ], 500);
        }
    }

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->login($request->validated());

            if (!$result) {
                return response()->json([
                    'message' => 'Identifiants invalides',
                ], 401);
            }

            return response()->json([
                'message' => 'Connexion réussie',
                'user' => $result['user'],
                'token' => $result['token'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la connexion',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json([
            'message' => 'Déconnexion réussie',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load(['inscriptions.country', 'documents']),
        ]);
    }
}


