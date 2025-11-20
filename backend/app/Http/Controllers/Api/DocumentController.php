<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Services\DocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function __construct(
        private DocumentService $documentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->isAdmin() && $request->has('user_id')
            ? $request->user_id
            : $request->user()->id;

        $documents = $this->documentService->getUserDocuments($userId);

        return response()->json($documents);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:10240'], // 10MB max
            'type' => ['required', 'string'],
            'inscription_id' => ['nullable', 'exists:inscriptions,id'],
        ]);

        $document = $this->documentService->upload(
            $request->user(),
            $request->file('file'),
            $request->type,
            $request->inscription_id
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

        return Storage::disk('public')->download($document->file_path, $document->name);
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
}



