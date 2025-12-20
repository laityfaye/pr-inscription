<?php

namespace App\Services;

use App\Models\Document;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class DocumentService
{
    public function upload(User $user, UploadedFile $file, string $type, ?int $inscriptionId = null, ?string $customName = null, ?int $workPermitApplicationId = null, ?int $residenceApplicationId = null, ?int $studyPermitRenewalApplicationId = null): Document
    {
        // S'assurer que le répertoire de base existe
        $baseDirectory = 'documents';
        if (!Storage::disk('public')->exists($baseDirectory)) {
            Storage::disk('public')->makeDirectory($baseDirectory, 0775, true);
        }
        
        // S'assurer que le répertoire de l'utilisateur existe
        $directory = $baseDirectory . '/' . $user->id;
        if (!Storage::disk('public')->exists($directory)) {
            Storage::disk('public')->makeDirectory($directory, 0775, true);
        }
        
        // Vérifier que le répertoire est accessible en écriture
        $storagePath = Storage::disk('public')->path($directory);
        if (!is_writable($storagePath)) {
            // Essayer de corriger les permissions si possible
            @chmod($storagePath, 0775);
            
            // Vérifier à nouveau
            if (!is_writable($storagePath)) {
                // Logger l'erreur sans utiliser Log::error pour éviter une boucle infinie
                error_log('Storage directory not writable: ' . $storagePath . ' (user_id: ' . $user->id . ')');
                
                throw new \RuntimeException(
                    'Le répertoire de stockage n\'est pas accessible en écriture. ' .
                    'Veuillez contacter l\'administrateur pour corriger les permissions. ' .
                    'Chemin: ' . $storagePath
                );
            }
        }
        
        $path = $file->store($directory, 'public');
        
        if (!$path) {
            throw new \RuntimeException('Impossible de sauvegarder le fichier. Vérifiez les permissions du répertoire de stockage.');
        }
        
        // Récupérer l'extension originale du fichier
        $originalExtension = $file->getClientOriginalExtension();
        
        // Utiliser le nom personnalisé si fourni, sinon utiliser le nom original du fichier
        $documentName = $customName && trim($customName) !== '' 
            ? trim($customName) 
            : $file->getClientOriginalName();
        
        // S'assurer que le nom du document a l'extension si elle manque
        if ($customName && trim($customName) !== '') {
            // Vérifier si le nom personnalisé a déjà une extension
            $hasExtension = preg_match('/\.[^.]+$/', $documentName);
            if (!$hasExtension && $originalExtension) {
                // Ajouter l'extension si elle manque
                $documentName .= '.' . $originalExtension;
            }
        }
        
        return Document::create([
            'user_id' => $user->id,
            'inscription_id' => $inscriptionId,
            'work_permit_application_id' => $workPermitApplicationId,
            'residence_application_id' => $residenceApplicationId,
            'study_permit_renewal_application_id' => $studyPermitRenewalApplicationId,
            'type' => $type,
            'name' => $documentName,
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'status' => 'pending',
        ]);
    }

    public function delete(Document $document): bool
    {
        Storage::disk('public')->delete($document->file_path);
        return $document->delete();
    }

    public function getUserDocuments(int $userId)
    {
        return Document::where('user_id', $userId)
            ->with([
                'validator',
                'inscription',
                'workPermitApplication',
                'residenceApplication',
                'studyPermitRenewalApplication'
            ])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getAllDocuments()
    {
        return Document::with([
            'user', 
            'validator',
            'inscription',
            'workPermitApplication',
            'residenceApplication',
            'studyPermitRenewalApplication'
        ])->orderBy('created_at', 'desc')->get();
    }

    public function approve(Document $document, User $validator): Document
    {
        $document->update([
            'status' => 'approved',
            'rejection_reason' => null,
            'validated_at' => now(),
            'validated_by' => $validator->id,
        ]);

        return $document->fresh(['validator']);
    }

    public function reject(Document $document, User $validator, string $reason): Document
    {
        $document->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'validated_at' => now(),
            'validated_by' => $validator->id,
        ]);

        return $document->fresh(['validator']);
    }
}














