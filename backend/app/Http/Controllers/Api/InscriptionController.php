<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Inscription;
use App\Services\InscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InscriptionController extends Controller
{
    public function __construct(
        private InscriptionService $inscriptionService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'country_id', 'user_id', 'date_from', 'date_to', 'search']);
        
        if ($request->user()->isAdmin()) {
            $inscriptions = $this->inscriptionService->getAllInscriptions($filters);
        } else {
            $inscriptions = $this->inscriptionService->getUserInscriptions($request->user()->id);
        }

        return response()->json($inscriptions);
    }

    public function show(Request $request, Inscription $inscription): JsonResponse
    {
        // Seuls les admins ou le propriétaire peuvent voir les détails
        if (!$request->user()->isAdmin() && $inscription->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Charger l'inscription avec les relations
        $inscription->load(['user', 'country']);
        
        // Récupérer tous les documents de l'utilisateur de cette inscription
        // (soit liés à l'inscription, soit sans inscription_id - documents généraux du client)
        $allDocuments = Document::where('user_id', $inscription->user_id)
            ->where(function($query) use ($inscription) {
                $query->where('inscription_id', $inscription->id)
                      ->orWhereNull('inscription_id');
            })
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Ajouter les documents à la relation pour la réponse JSON
        $inscription->setRelation('documents', $allDocuments);

        return response()->json($inscription);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'country_id' => ['required', 'exists:countries,id'],
            'current_education_level' => ['nullable', 'in:bac,licence_1,licence_2,licence_3,master_1,master_2'],
            'current_field' => ['nullable', 'string', 'max:255'],
            'requested_education_level' => ['nullable', 'in:bac,licence_1,licence_2,licence_3,master_1,master_2'],
            'requested_field' => ['nullable', 'string', 'max:255'],
        ]);

        $inscription = $this->inscriptionService->create([
            'user_id' => $request->user()->id,
            'country_id' => $request->country_id,
            'status' => 'pending',
            'current_education_level' => $request->input('current_education_level'),
            'current_field' => $request->input('current_field'),
            'requested_education_level' => $request->input('requested_education_level'),
            'requested_field' => $request->input('requested_field'),
        ]);

        return response()->json($inscription->load(['country', 'documents']), 201);
    }

    public function updateStatus(Request $request, Inscription $inscription): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'status' => ['required', 'in:pending,in_progress,validated,rejected'],
            'notes' => ['nullable', 'string'],
        ]);

        $this->inscriptionService->updateStatus(
            $inscription,
            $request->status,
            $request->notes
        );

        return response()->json([
            'message' => 'Statut mis à jour',
            'inscription' => $inscription->fresh(['user', 'country', 'documents']),
        ]);
    }

    public function notifyClient(Request $request, Inscription $inscription): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Vérifier que l'inscription est validée
        if ($inscription->status !== 'validated') {
            return response()->json([
                'message' => 'Seules les inscriptions validées peuvent être notifiées au client'
            ], 400);
        }

        // Mettre à jour la date de notification
        $inscription->update([
            'client_notified_at' => now(),
        ]);

        return response()->json([
            'message' => 'Client notifié avec succès',
            'inscription' => $inscription->fresh(['user', 'country', 'documents']),
        ]);
    }
}



