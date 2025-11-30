<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use App\Services\MessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    public function __construct(
        private MessageService $messageService
    ) {}

    public function conversations(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            // Admin voit toutes les conversations avec les clients
            // Compter les messages non lus que l'admin a reçus de chaque client
            $conversations = User::where('role', 'client')
                ->withCount(['sentMessages as unread_count' => function ($query) use ($user) {
                    $query->where('receiver_id', $user->id)
                          ->where('is_read', 0);
                }])
                ->get();
        } else {
            // Client voit seulement l'admin
            $admin = User::where('role', 'admin')->first();
            $conversations = $admin ? [$admin] : [];
        }

        return response()->json($conversations);
    }

    public function messages(Request $request, ?User $user = null): JsonResponse
    {
        $currentUser = $request->user();

        if (!$user) {
            if ($currentUser->isAdmin()) {
                $user = User::where('role', 'client')->first();
            } else {
                $user = User::where('role', 'admin')->first();
            }
        }

        if (!$user) {
            return response()->json(['messages' => []]);
        }

        $applicationType = $request->query('application_type');
        $applicationId = $request->query('application_id');
        $sinceId = $request->query('since_id') ? (int) $request->query('since_id') : null;
        $limit = $request->query('limit') ? (int) $request->query('limit') : null;

        $messages = $this->messageService->getConversation($currentUser, $user, $applicationType, $applicationId, $sinceId, $limit);

        // Marquer les messages comme lus
        $query = Message::where('sender_id', $user->id)
            ->where('receiver_id', $currentUser->id)
            ->where('is_read', 0);

        if ($applicationType && $applicationId) {
            if ($applicationType === 'inscription') {
                $query->where('inscription_id', $applicationId);
            } elseif ($applicationType === 'work_permit') {
                $query->where('work_permit_application_id', $applicationId);
            } elseif ($applicationType === 'residence') {
                $query->where('residence_application_id', $applicationId);
            }
        }

        $query->update(['is_read' => true]);

        return response()->json([
            'messages' => $messages,
            'other_user' => $user,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'receiver_id' => ['required', 'exists:users,id'],
            'content' => ['nullable', 'string'],
            'application_type' => ['nullable', 'in:inscription,work_permit,residence'],
            'application_id' => ['nullable', 'integer'],
            'status_update' => ['nullable', 'string', 'max:255'],
            'file' => ['nullable', 'file', 'max:10240'], // 10MB max
        ]);

        $receiver = User::findOrFail($request->receiver_id);
        $filePath = null;
        $fileName = null;
        $fileType = null;
        $fileSize = null;

        // Gérer l'upload de fichier
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = $file->getClientOriginalName();
            $fileType = $file->getMimeType();
            $fileSize = $file->getSize();
            $filePath = $file->store('messages/' . $request->user()->id, 'public');
        }

        // Vérifier que le contenu ou le fichier est présent
        if (!$request->input('content') && !$filePath && !$request->input('status_update')) {
            return response()->json(['message' => 'Le message doit contenir du texte, un fichier ou une mise à jour de statut'], 422);
        }

        $message = $this->messageService->send(
            $request->user(),
            $receiver,
            $request->input('content') ?? '',
            $request->input('application_type'),
            $request->input('application_id'),
            $request->input('status_update'),
            $filePath,
            $fileName,
            $fileType,
            $fileSize
        );

        return response()->json($message->load(['sender', 'receiver', 'inscription', 'workPermitApplication', 'residenceApplication']), 201);
    }

    public function downloadFile(Request $request, Message $message): BinaryFileResponse|JsonResponse
    {
        try {
            if (!$message->file_path) {
                return response()->json(['message' => 'Aucun fichier associé à ce message'], 404);
            }

            // Vérifier les permissions
            $user = $request->user();
            if (!$user->isAdmin() && $message->sender_id !== $user->id && $message->receiver_id !== $user->id) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }

            // Vérifier que le fichier existe
            if (!Storage::disk('public')->exists($message->file_path)) {
                Log::error('File not found: ' . $message->file_path);
                Log::error('Storage path: ' . Storage::disk('public')->path(''));
                return response()->json(['message' => 'Fichier introuvable: ' . $message->file_path], 404);
            }

            $filePath = Storage::disk('public')->path($message->file_path);
            
            // Vérifier que le fichier existe physiquement
            if (!file_exists($filePath)) {
                Log::error('Physical file not found: ' . $filePath);
                return response()->json(['message' => 'Fichier introuvable sur le serveur'], 404);
            }
            $fileName = $message->file_name ?: basename($message->file_path);

            // S'assurer que le nom du fichier a la bonne extension
            if ($message->file_type && $fileName) {
                $extension = pathinfo($fileName, PATHINFO_EXTENSION);
                if (!$extension) {
                    // Déduire l'extension du type MIME
                    $mimeToExt = [
                        'image/jpeg' => 'jpg',
                        'image/png' => 'png',
                        'image/gif' => 'gif',
                        'image/webp' => 'webp',
                        'application/pdf' => 'pdf',
                        'application/msword' => 'doc',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
                        'application/vnd.ms-excel' => 'xls',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
                        'video/mp4' => 'mp4',
                        'video/quicktime' => 'mov',
                        'video/x-msvideo' => 'avi',
                    ];
                    $ext = $mimeToExt[$message->file_type] ?? '';
                    if ($ext) {
                        $fileName .= '.' . $ext;
                    }
                }
            }

            return response()->download($filePath, $fileName, [
                'Content-Type' => $message->file_type ?: 'application/octet-stream',
            ]);
        } catch (\Exception $e) {
            Log::error('Error downloading message file: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['message' => 'Erreur lors du téléchargement du fichier: ' . $e->getMessage()], 500);
        }
    }

    public function unreadCount(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['count' => 0]);
            }
            $count = $this->messageService->getUnreadCount($user);
            return response()->json(['count' => $count]);
        } catch (\Exception $e) {
            Log::error('Error in unreadCount: ' . $e->getMessage());
            return response()->json(['count' => 0, 'error' => $e->getMessage()], 500);
        }
    }
}


