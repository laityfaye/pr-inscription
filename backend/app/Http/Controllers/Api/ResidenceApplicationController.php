<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\ResidenceApplication;
use App\Services\ResidenceApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResidenceApplicationController extends Controller
{
    public function __construct(
        private ResidenceApplicationService $service
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'user_id', 'date_from', 'date_to', 'search']);
        $minimal = $request->query('minimal', false) === 'true' || $request->query('minimal') === '1';
        
        if ($request->user()->isAdmin()) {
            $applications = $this->service->getAllApplications($filters);
        } else {
            $applications = $this->service->getUserApplications($request->user()->id, $minimal);
        }

        return response()->json($applications);
    }

    public function show(Request $request, ResidenceApplication $residenceApplication): JsonResponse
    {
        if (!$request->user()->isAdmin() && $residenceApplication->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $residenceApplication->load(['user']);
        
        // Récupérer uniquement les documents liés à cette demande de résidence
        $allDocuments = Document::where('user_id', $residenceApplication->user_id)
            ->where('residence_application_id', $residenceApplication->id)
            ->with(['validator'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        $residenceApplication->setRelation('documents', $allDocuments);

        return response()->json($residenceApplication);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'current_residence_country' => ['nullable', 'string', 'max:255'],
            'residence_type' => ['nullable', 'string', 'max:255'],
            'family_members' => ['nullable', 'array'],
            'employment_status' => ['nullable', 'string'],
            'financial_situation' => ['nullable', 'string'],
        ]);

        $application = $this->service->create([
            'user_id' => $request->user()->id,
            'current_residence_country' => $request->input('current_residence_country'),
            'residence_type' => $request->input('residence_type'),
            'family_members' => $request->input('family_members'),
            'employment_status' => $request->input('employment_status'),
            'financial_situation' => $request->input('financial_situation'),
        ]);

        return response()->json($application->load(['documents']), 201);
    }

    public function updateStatus(Request $request, ResidenceApplication $residenceApplication): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'status' => ['required', 'in:pending,in_progress,approved,rejected'],
            'notes' => ['nullable', 'string'],
            'rejection_reason' => ['nullable', 'string', 'min:10'],
        ]);

        $this->service->updateStatus(
            $residenceApplication,
            $request->status,
            $request->notes,
            $request->rejection_reason
        );

        return response()->json([
            'message' => 'Statut mis à jour',
            'application' => $residenceApplication->fresh(['user', 'documents']),
        ]);
    }

    public function update(Request $request, ResidenceApplication $residenceApplication): JsonResponse
    {
        // Vérifier que l'utilisateur est le propriétaire ou un admin
        if (!$request->user()->isAdmin() && $residenceApplication->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Vérifier que la demande est en attente (seulement pour les clients)
        if (!$request->user()->isAdmin() && $residenceApplication->status !== 'pending') {
            return response()->json([
                'message' => 'Seules les demandes en attente peuvent être modifiées'
            ], 400);
        }

        $request->validate([
            'current_residence_country' => ['nullable', 'string', 'max:255'],
            'residence_type' => ['nullable', 'string', 'max:255'],
            'family_members' => ['nullable', 'array'],
            'employment_status' => ['nullable', 'string'],
            'financial_situation' => ['nullable', 'string'],
        ]);

        $residenceApplication->update($request->only([
            'current_residence_country',
            'residence_type',
            'family_members',
            'employment_status',
            'financial_situation',
        ]));

        return response()->json($residenceApplication->fresh(['documents']));
    }

    public function destroy(Request $request, ResidenceApplication $residenceApplication): JsonResponse
    {
        // Vérifier que l'utilisateur est le propriétaire ou un admin
        if (!$request->user()->isAdmin() && $residenceApplication->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Vérifier que la demande est en attente (seulement pour les clients)
        if (!$request->user()->isAdmin() && $residenceApplication->status !== 'pending') {
            return response()->json([
                'message' => 'Seules les demandes en attente peuvent être supprimées'
            ], 400);
        }

        // Charger les documents associés
        $residenceApplication->load('documents');

        // Supprimer les fichiers physiques des documents
        foreach ($residenceApplication->documents as $document) {
            if ($document->file_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($document->file_path);
            }
        }

        // Supprimer la demande (les documents en base seront supprimés automatiquement par cascade)
        $residenceApplication->delete();

        return response()->json(['message' => 'Demande supprimée avec succès']);
    }

    public function notifyClient(Request $request, ResidenceApplication $residenceApplication): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($residenceApplication->status !== 'approved') {
            return response()->json([
                'message' => 'Seules les demandes approuvées peuvent être notifiées au client'
            ], 400);
        }

        $this->service->notifyClient($residenceApplication);

        return response()->json([
            'message' => 'Client notifié avec succès',
            'application' => $residenceApplication->fresh(['user', 'documents']),
        ]);
    }
}

