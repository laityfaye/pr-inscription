<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\WorkPermitApplication;
use App\Services\WorkPermitApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkPermitApplicationController extends Controller
{
    public function __construct(
        private WorkPermitApplicationService $service
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'work_permit_country_id', 'user_id', 'visa_type', 'date_from', 'date_to', 'search']);
        $minimal = $request->query('minimal', false) === 'true' || $request->query('minimal') === '1';
        
        if ($request->user()->isAdmin()) {
            $applications = $this->service->getAllApplications($filters);
        } else {
            $applications = $this->service->getUserApplications($request->user()->id, $minimal);
        }

        return response()->json($applications);
    }

    public function show(Request $request, WorkPermitApplication $workPermitApplication): JsonResponse
    {
        if (!$request->user()->isAdmin() && $workPermitApplication->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $workPermitApplication->load(['user', 'country']);
        
        // Récupérer uniquement les documents liés à cette demande de permis de travail
        $allDocuments = Document::where('user_id', $workPermitApplication->user_id)
            ->where('work_permit_application_id', $workPermitApplication->id)
            ->with(['validator'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        $workPermitApplication->setRelation('documents', $allDocuments);

        return response()->json($workPermitApplication);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'work_permit_country_id' => ['required', 'exists:work_permit_countries,id'],
            'visa_type' => ['required', 'in:visitor_visa,work_permit'],
            'age' => ['nullable', 'integer', 'min:18', 'max:100'],
            'profession' => ['nullable', 'string', 'max:255'],
            'experience_years' => ['nullable', 'integer', 'min:0', 'max:50'],
            'current_employer' => ['nullable', 'string', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'education_level' => ['nullable', 'string', 'max:255'],
            'language_skills' => ['nullable', 'string'],
            'user_id' => ['nullable', 'exists:users,id'], // Permettre à l'admin de spécifier un user_id
        ]);

        // Si admin et user_id fourni, utiliser ce user_id, sinon utiliser l'utilisateur connecté
        $userId = $request->user()->isAdmin() && $request->has('user_id') 
            ? $request->user_id 
            : $request->user()->id;

        $application = $this->service->create([
            'user_id' => $userId,
            'work_permit_country_id' => $request->work_permit_country_id,
            'visa_type' => $request->visa_type,
            'age' => $request->age,
            'profession' => $request->profession,
            'experience_years' => $request->experience_years,
            'current_employer' => $request->current_employer,
            'phone_number' => $request->phone_number,
            'address' => $request->address,
            'education_level' => $request->education_level,
            'language_skills' => $request->language_skills,
        ]);

        return response()->json($application->load(['country', 'documents']), 201);
    }

    public function updateStatus(Request $request, WorkPermitApplication $workPermitApplication): JsonResponse
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
            $workPermitApplication,
            $request->status,
            $request->notes,
            $request->rejection_reason
        );

        return response()->json([
            'message' => 'Statut mis à jour',
            'application' => $workPermitApplication->fresh(['user', 'country', 'documents']),
        ]);
    }

    public function update(Request $request, WorkPermitApplication $workPermitApplication): JsonResponse
    {
        // Vérifier que l'utilisateur est le propriétaire ou un admin
        if (!$request->user()->isAdmin() && $workPermitApplication->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Vérifier que la demande est en attente (seulement pour les clients)
        if (!$request->user()->isAdmin() && $workPermitApplication->status !== 'pending') {
            return response()->json([
                'message' => 'Seules les demandes en attente peuvent être modifiées'
            ], 400);
        }

        $request->validate([
            'work_permit_country_id' => ['sometimes', 'required', 'exists:work_permit_countries,id'],
            'visa_type' => ['sometimes', 'required', 'in:visitor_visa,work_permit'],
            'age' => ['nullable', 'integer', 'min:18', 'max:100'],
            'profession' => ['nullable', 'string', 'max:255'],
            'experience_years' => ['nullable', 'integer', 'min:0', 'max:50'],
            'current_employer' => ['nullable', 'string', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'education_level' => ['nullable', 'string', 'max:255'],
            'language_skills' => ['nullable', 'string'],
        ]);

        $workPermitApplication->update($request->only([
            'work_permit_country_id',
            'visa_type',
            'age',
            'profession',
            'experience_years',
            'current_employer',
            'phone_number',
            'address',
            'education_level',
            'language_skills',
        ]));

        return response()->json($workPermitApplication->fresh(['country', 'documents']));
    }

    public function destroy(Request $request, WorkPermitApplication $workPermitApplication): JsonResponse
    {
        // Vérifier que l'utilisateur est le propriétaire ou un admin
        if (!$request->user()->isAdmin() && $workPermitApplication->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Vérifier que la demande est en attente (seulement pour les clients)
        if (!$request->user()->isAdmin() && $workPermitApplication->status !== 'pending') {
            return response()->json([
                'message' => 'Seules les demandes en attente peuvent être supprimées'
            ], 400);
        }

        // Charger les documents associés
        $workPermitApplication->load('documents');

        // Supprimer les fichiers physiques des documents
        foreach ($workPermitApplication->documents as $document) {
            if ($document->file_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($document->file_path);
            }
        }

        // Supprimer la demande (les documents en base seront supprimés automatiquement par cascade)
        $workPermitApplication->delete();

        return response()->json(['message' => 'Demande supprimée avec succès']);
    }

    public function notifyClient(Request $request, WorkPermitApplication $workPermitApplication): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($workPermitApplication->status !== 'approved') {
            return response()->json([
                'message' => 'Seules les demandes approuvées peuvent être notifiées au client'
            ], 400);
        }

        $this->service->notifyClient($workPermitApplication);

        return response()->json([
            'message' => 'Client notifié avec succès',
            'application' => $workPermitApplication->fresh(['user', 'country', 'documents']),
        ]);
    }
}

