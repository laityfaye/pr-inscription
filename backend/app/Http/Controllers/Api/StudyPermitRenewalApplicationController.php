<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\StudyPermitRenewalApplication;
use App\Services\StudyPermitRenewalApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudyPermitRenewalApplicationController extends Controller
{
    public function __construct(
        private StudyPermitRenewalApplicationService $service
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

    public function show(Request $request, StudyPermitRenewalApplication $studyPermitRenewalApplication): JsonResponse
    {
        if (!$request->user()->isAdmin() && $studyPermitRenewalApplication->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $studyPermitRenewalApplication->load(['user']);
        
        // Récupérer uniquement les documents liés à cette demande de renouvellement
        $allDocuments = Document::where('user_id', $studyPermitRenewalApplication->user_id)
            ->where('study_permit_renewal_application_id', $studyPermitRenewalApplication->id)
            ->with(['validator'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        $studyPermitRenewalApplication->setRelation('documents', $allDocuments);

        return response()->json($studyPermitRenewalApplication);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'arrival_date' => ['nullable', 'date'],
            'institution_name' => ['nullable', 'string', 'max:255'],
            'expiration_date' => ['nullable', 'date'],
            'address' => ['nullable', 'string', 'max:255'],
            'address_number' => ['nullable', 'string', 'max:50'],
            'country' => ['nullable', 'string', 'max:255'],
        ]);

        $application = $this->service->create([
            'user_id' => $request->user()->id,
            'arrival_date' => $request->input('arrival_date'),
            'institution_name' => $request->input('institution_name'),
            'expiration_date' => $request->input('expiration_date'),
            'address' => $request->input('address'),
            'address_number' => $request->input('address_number'),
            'country' => $request->input('country', 'Canada'),
        ]);

        return response()->json($application->load(['documents']), 201);
    }

    public function updateStatus(Request $request, StudyPermitRenewalApplication $studyPermitRenewalApplication): JsonResponse
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
            $studyPermitRenewalApplication,
            $request->status,
            $request->notes,
            $request->rejection_reason
        );

        return response()->json([
            'message' => 'Statut mis à jour',
            'application' => $studyPermitRenewalApplication->fresh(['user', 'documents']),
        ]);
    }

    public function update(Request $request, StudyPermitRenewalApplication $studyPermitRenewalApplication): JsonResponse
    {
        // Vérifier que l'utilisateur est le propriétaire ou un admin
        if (!$request->user()->isAdmin() && $studyPermitRenewalApplication->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Vérifier que la demande est en attente (seulement pour les clients)
        if (!$request->user()->isAdmin() && $studyPermitRenewalApplication->status !== 'pending') {
            return response()->json([
                'message' => 'Seules les demandes en attente peuvent être modifiées'
            ], 400);
        }

        $request->validate([
            'arrival_date' => ['nullable', 'date'],
            'institution_name' => ['nullable', 'string', 'max:255'],
            'expiration_date' => ['nullable', 'date'],
            'address' => ['nullable', 'string', 'max:255'],
            'address_number' => ['nullable', 'string', 'max:50'],
            'country' => ['nullable', 'string', 'max:255'],
        ]);

        $studyPermitRenewalApplication->update($request->only([
            'arrival_date',
            'institution_name',
            'expiration_date',
            'address',
            'address_number',
            'country',
        ]));

        return response()->json($studyPermitRenewalApplication->fresh(['documents']));
    }

    public function destroy(Request $request, StudyPermitRenewalApplication $studyPermitRenewalApplication): JsonResponse
    {
        // Vérifier que l'utilisateur est le propriétaire ou un admin
        if (!$request->user()->isAdmin() && $studyPermitRenewalApplication->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Vérifier que la demande est en attente (seulement pour les clients)
        if (!$request->user()->isAdmin() && $studyPermitRenewalApplication->status !== 'pending') {
            return response()->json([
                'message' => 'Seules les demandes en attente peuvent être supprimées'
            ], 400);
        }

        // Charger les documents associés
        $studyPermitRenewalApplication->load('documents');

        // Supprimer les fichiers physiques des documents
        foreach ($studyPermitRenewalApplication->documents as $document) {
            if ($document->file_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($document->file_path);
            }
        }

        // Supprimer la demande (les documents en base seront supprimés automatiquement par cascade)
        $studyPermitRenewalApplication->delete();

        return response()->json(['message' => 'Demande supprimée avec succès']);
    }

    public function notifyClient(Request $request, StudyPermitRenewalApplication $studyPermitRenewalApplication): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($studyPermitRenewalApplication->status !== 'approved') {
            return response()->json([
                'message' => 'Seules les demandes approuvées peuvent être notifiées au client'
            ], 400);
        }

        $this->service->notifyClient($studyPermitRenewalApplication);

        return response()->json([
            'message' => 'Client notifié avec succès',
            'application' => $studyPermitRenewalApplication->fresh(['user', 'documents']),
        ]);
    }
}

