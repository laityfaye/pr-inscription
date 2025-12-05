<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DocumentStoreRequest;
use App\Models\Document;
use App\Services\DocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class DocumentController extends Controller
{
    public function __construct(
        private DocumentService $documentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        // Si admin, peut voir tous les documents ou filtrer par user_id
        if ($request->user()->isAdmin()) {
            if ($request->has('user_id')) {
                $documents = $this->documentService->getUserDocuments($request->user_id);
            } else {
                $documents = $this->documentService->getAllDocuments();
            }
        } else {
            // Client voit seulement ses documents
            $documents = $this->documentService->getUserDocuments($request->user()->id);
        }

        return response()->json($documents);
    }

    public function store(DocumentStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Vérifier que les IDs appartiennent à l'utilisateur (sécurité)
        $user = $request->user();
        if (!empty($validated['inscription_id'])) {
            $inscription = \App\Models\Inscription::find($validated['inscription_id']);
            if (!$inscription || $inscription->user_id !== $user->id) {
                return response()->json([
                    'message' => 'La préinscription sélectionnée ne vous appartient pas.',
                    'errors' => ['inscription_id' => ['La préinscription sélectionnée ne vous appartient pas.']]
                ], 422);
            }
        }
        
        if (!empty($validated['work_permit_application_id'])) {
            $workPermit = \App\Models\WorkPermitApplication::find($validated['work_permit_application_id']);
            if (!$workPermit || $workPermit->user_id !== $user->id) {
                return response()->json([
                    'message' => 'La demande de permis de travail sélectionnée ne vous appartient pas.',
                    'errors' => ['work_permit_application_id' => ['La demande de permis de travail sélectionnée ne vous appartient pas.']]
                ], 422);
            }
        }
        
        if (!empty($validated['residence_application_id'])) {
            $residence = \App\Models\ResidenceApplication::find($validated['residence_application_id']);
            if (!$residence || $residence->user_id !== $user->id) {
                return response()->json([
                    'message' => 'La demande de résidence sélectionnée ne vous appartient pas.',
                    'errors' => ['residence_application_id' => ['La demande de résidence sélectionnée ne vous appartient pas.']]
                ], 422);
            }
        }

        $document = $this->documentService->upload(
            $user,
            $request->file('file'),
            $validated['type'],
            $validated['inscription_id'] ?? null,
            $validated['name'] ?? null,
            $validated['work_permit_application_id'] ?? null,
            $validated['residence_application_id'] ?? null
        );

        return response()->json($document, 201);
    }

    public function show(Request $request, Document $document): JsonResponse
    {
        // Vérifier les permissions : admin ou propriétaire
        if (!$request->user()->isAdmin() && $document->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return response()->json($document);
    }

    public function download(Request $request, Document $document)
    {
        // Vérifier les permissions : admin ou propriétaire
        if (!$request->user()->isAdmin() && $document->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if (!Storage::disk('public')->exists($document->file_path)) {
            return response()->json(['message' => 'Fichier introuvable'], 404);
        }

        $filePath = Storage::disk('public')->path($document->file_path);
        
        // Détecter le type MIME du fichier réel
        $mimeType = $document->mime_type;
        if (!$mimeType || $mimeType === 'application/octet-stream') {
            $mimeType = mime_content_type($filePath);
        }
        if (!$mimeType) {
            $mimeType = 'application/octet-stream';
        }
        
        // S'assurer que le nom du fichier téléchargé a la bonne extension
        $downloadName = $document->name;
        $fileExtension = pathinfo($filePath, PATHINFO_EXTENSION);
        
        // Si le nom n'a pas d'extension, l'ajouter depuis le fichier réel
        if (!preg_match('/\.[^.]+$/', $downloadName) && $fileExtension) {
            $downloadName .= '.' . $fileExtension;
        }

        return response()->download($filePath, $downloadName, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'attachment; filename="' . addslashes($downloadName) . '"',
        ]);
    }

    public function view(Request $request, Document $document)
    {
        // Vérifier les permissions : admin ou propriétaire
        if (!$request->user()->isAdmin() && $document->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if (!Storage::disk('public')->exists($document->file_path)) {
            return response()->json(['message' => 'Fichier introuvable'], 404);
        }

        $filePath = Storage::disk('public')->path($document->file_path);
        $mimeType = $document->mime_type ?: mime_content_type($filePath) ?: 'application/octet-stream';

        return response()->file($filePath, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . $document->name . '"',
        ]);
    }

    public function destroy(Request $request, Document $document): JsonResponse
    {
        // Vérifier les permissions : admin ou propriétaire
        if (!$request->user()->isAdmin() && $document->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $this->documentService->delete($document);

        return response()->json(['message' => 'Document supprimé']);
    }

    public function approve(Request $request, Document $document): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $document = $this->documentService->approve($document, $request->user());

        return response()->json($document);
    }

    public function reject(Request $request, Document $document): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'rejection_reason' => ['required', 'string', 'min:10', 'max:1000'],
        ]);

        $document = $this->documentService->reject(
            $document,
            $request->user(),
            $request->rejection_reason
        );

        return response()->json($document);
    }
}



