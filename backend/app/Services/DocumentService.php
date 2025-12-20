<?php

namespace App\Services;

use App\Models\Document;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class DocumentService
{
    public function upload(User $user, UploadedFile $file, string $type, ?int $inscriptionId = null, ?string $customName = null, ?int $workPermitApplicationId = null, ?int $residenceApplicationId = null, ?int $studyPermitRenewalApplicationId = null): Document
    {
        $path = $file->store('documents/' . $user->id, 'public');
        
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














