<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
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
        
        // Logger pour le diagnostic
        $storagePath = Storage::disk('public')->path($path);
        $exists = Storage::disk('public')->exists($path);
        
        Log::info('StorageController::serve', [
            'requested_path' => $path,
            'storage_path' => $storagePath,
            'exists' => $exists,
            'storage_root' => Storage::disk('public')->path(''),
        ]);
        
        // Vérifier que le fichier existe
        if (!$exists) {
            // Vérifier aussi si le fichier existe physiquement (au cas où Storage ne le trouve pas)
            if (file_exists($storagePath)) {
                Log::warning('File exists physically but Storage::exists() returned false', [
                    'path' => $path,
                    'storage_path' => $storagePath,
                ]);
                // Continuer quand même si le fichier existe physiquement
            } else {
                Log::error('File not found', [
                    'path' => $path,
                    'storage_path' => $storagePath,
                    'storage_root' => Storage::disk('public')->path(''),
                ]);
                return response()->json([
                    'message' => 'Fichier introuvable',
                    'path' => $path,
                    'storage_path' => $storagePath,
                ], 404)
                    ->withHeaders($this->getCorsHeaders($request));
            }
        }
        
        // Obtenir le chemin complet du fichier
        $filePath = Storage::disk('public')->path($path);
        
        // Vérifier que le fichier existe physiquement
        if (!file_exists($filePath)) {
            Log::error('Physical file not found', [
                'path' => $path,
                'file_path' => $filePath,
            ]);
            return response()->json([
                'message' => 'Fichier introuvable sur le serveur',
                'path' => $path,
            ], 404)
                ->withHeaders($this->getCorsHeaders($request));
        }
        
        // Déterminer le type MIME
        $mimeType = mime_content_type($filePath) ?: 'application/octet-stream';
        
        // Retourner le fichier avec les en-têtes appropriés
        $headers = array_merge([
            'Content-Type' => $mimeType,
            'Cache-Control' => 'public, max-age=31536000', // Cache 1 an
        ], $this->getCorsHeaders($request));
        
        return response()->file($filePath, $headers);
    }
}

