<?php

namespace App\Services;

use App\Models\Document;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class DocumentService
{
    public function upload(User $user, UploadedFile $file, string $type, ?int $inscriptionId = null): Document
    {
        $path = $file->store('documents/' . $user->id, 'public');
        
        return Document::create([
            'user_id' => $user->id,
            'inscription_id' => $inscriptionId,
            'type' => $type,
            'name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);
    }

    public function delete(Document $document): bool
    {
        Storage::disk('public')->delete($document->file_path);
        return $document->delete();
    }

    public function getUserDocuments(int $userId)
    {
        return Document::where('user_id', $userId)->get();
    }
}














