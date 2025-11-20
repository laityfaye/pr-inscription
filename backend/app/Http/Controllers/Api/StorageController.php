<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class StorageController extends Controller
{
    /**
     * Servir un fichier depuis le storage public
     * Route: /api/storage/{path}
     */
    public function serve(Request $request, string $path): BinaryFileResponse|\Illuminate\Http\JsonResponse
    {
        // Nettoyer le chemin pour éviter les attaques de traversal
        $path = str_replace('..', '', $path);
        $path = ltrim($path, '/');
        
        // Vérifier que le fichier existe
        if (!Storage::disk('public')->exists($path)) {
            return response()->json(['message' => 'Fichier introuvable'], 404);
        }
        
        // Obtenir le chemin complet du fichier
        $filePath = Storage::disk('public')->path($path);
        
        // Déterminer le type MIME
        $mimeType = mime_content_type($filePath) ?: 'application/octet-stream';
        
        // Retourner le fichier avec les en-têtes appropriés
        return response()->file($filePath, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'public, max-age=31536000', // Cache 1 an
        ]);
    }
}

