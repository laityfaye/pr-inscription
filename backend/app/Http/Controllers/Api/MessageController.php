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
            // Client voit seulement l'admin avec l'ID 5 (admin principal)
            $admin = User::where('role', 'admin')->where('id', 5)->first();
            if (!$admin) {
                // Fallback: utiliser le premier admin si l'ID 5 n'existe pas
                $admin = User::where('role', 'admin')->first();
            }
            $conversations = $admin ? [$admin] : [];
        }

        return response()->json($conversations);
    }

    public function messages(Request $request, $userId = null): JsonResponse
    {
        try {
            $currentUser = $request->user();

            // Résoudre l'utilisateur manuellement pour éviter les problèmes de route model binding
            $user = null;
            if ($userId && $userId !== '') {
                $userId = (int) $userId;
                $user = User::find($userId);
                if (!$user) {
                    try {
                        Log::warning('User not found', ['user_id' => $userId]);
                    } catch (\Exception $e) {
                        // Ignore logging errors
                    }
                    return response()->json(['messages' => [], 'error' => 'Utilisateur introuvable'], 404);
                }
            }

            if (!$user) {
                if ($currentUser->isAdmin()) {
                    $user = User::where('role', 'client')->first();
                } else {
                    // Pour un client, utiliser l'admin avec l'ID 5 (admin principal)
                    $user = User::where('role', 'admin')->where('id', 5)->first();
                    if (!$user) {
                        // Fallback: utiliser le premier admin si l'ID 5 n'existe pas
                        $user = User::where('role', 'admin')->first();
                    }
                }
            }

            if (!$user) {
                return response()->json(['messages' => []]);
            }

            $applicationType = $request->query('application_type');
            $applicationId = $request->query('application_id') ? (int) $request->query('application_id') : null;
            $sinceId = $request->query('since_id') ? (int) $request->query('since_id') : null;
            $limit = $request->query('limit') ? (int) $request->query('limit') : null;


            $messages = $this->messageService->getConversation($currentUser, $user, $applicationType, $applicationId, $sinceId, $limit);

            // Marquer les messages comme lus
            // Si une application est sélectionnée, marquer comme lus:
            // 1. Les messages généraux (sans application)
            // 2. Les messages de cette application spécifique
            // Sinon, marquer tous les messages non lus
            $query = Message::where('sender_id', $user->id)
                ->where('receiver_id', $currentUser->id)
                ->where('is_read', 0);

            if ($applicationType && $applicationId) {
                $query->where(function ($q) use ($applicationType, $applicationId) {
                    // Messages généraux (sans application)
                    $q->where(function ($generalQ) {
                        $generalQ->whereNull('application_type')
                                 ->whereNull('inscription_id')
                                 ->whereNull('work_permit_application_id')
                                 ->whereNull('residence_application_id');
                    });
                    
                    // OU messages de cette application spécifique
                    if ($applicationType === 'inscription') {
                        $q->orWhere('inscription_id', $applicationId);
                    } elseif ($applicationType === 'work_permit') {
                        $q->orWhere('work_permit_application_id', $applicationId);
                    } elseif ($applicationType === 'residence') {
                        $q->orWhere('residence_application_id', $applicationId);
                    }
                });
            }

            $query->update(['is_read' => true]);

            // S'assurer que les messages sont bien sérialisés
            $messagesArray = $messages->map(function($message) {
                try {
                    return [
                        'id' => $message->id ?? null,
                        'sender_id' => $message->sender_id ?? null,
                        'receiver_id' => $message->receiver_id ?? null,
                        'content' => $message->content ?? null,
                        'is_read' => (bool) ($message->is_read ?? false),
                        'application_type' => $message->application_type ?? null,
                        'inscription_id' => $message->inscription_id ?? null,
                        'work_permit_application_id' => $message->work_permit_application_id ?? null,
                        'residence_application_id' => $message->residence_application_id ?? null,
                        'status_update' => $message->status_update ?? null,
                        'file_path' => $message->file_path ?? null,
                        'file_name' => $message->file_name ?? null,
                        'file_type' => $message->file_type ?? null,
                        'file_size' => $message->file_size ?? null,
                        'created_at' => $message->created_at ? ($message->created_at instanceof \Carbon\Carbon ? $message->created_at->toISOString() : (string) $message->created_at) : null,
                        'updated_at' => $message->updated_at ? ($message->updated_at instanceof \Carbon\Carbon ? $message->updated_at->toISOString() : (string) $message->updated_at) : null,
                        'sender' => ($message->sender && isset($message->sender->id)) ? [
                            'id' => $message->sender->id,
                            'name' => $message->sender->name ?? null,
                            'email' => $message->sender->email ?? null,
                        ] : null,
                        'receiver' => ($message->receiver && isset($message->receiver->id)) ? [
                            'id' => $message->receiver->id,
                            'name' => $message->receiver->name ?? null,
                            'email' => $message->receiver->email ?? null,
                        ] : null,
                    ];
                } catch (\Exception $e) {
                    try {
                        Log::error('Error serializing message', [
                            'message_id' => $message->id ?? 'unknown',
                            'error' => $e->getMessage(),
                        ]);
                    } catch (\Exception $logException) {
                        // Ignore logging errors
                    }
                    return null;
                }
            })->filter()->values()->toArray();

            // Sérialiser l'utilisateur manuellement pour éviter les problèmes
            $otherUser = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ];


            return response()->json([
                'messages' => $messagesArray,
                'other_user' => $otherUser,
            ]);
        } catch (\Exception $e) {
            try {
                Log::error('Error in messages method: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                    'user_id' => $userId ?? null,
                ]);
            } catch (\Exception $logException) {
                // Ignore logging errors - this prevents logging failures from hiding the real error
            }
            return response()->json([
                'message' => 'Une erreur est survenue',
                'error' => $e->getMessage()
            ], 500);
        }
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
                try {
                    Log::error('File not found: ' . $message->file_path);
                    Log::error('Storage path: ' . Storage::disk('public')->path(''));
                } catch (\Exception $e) {
                    // Ignore logging errors
                }
                return response()->json(['message' => 'Fichier introuvable: ' . $message->file_path], 404);
            }

            $filePath = Storage::disk('public')->path($message->file_path);
            
            // Vérifier que le fichier existe physiquement
            if (!file_exists($filePath)) {
                try {
                    Log::error('Physical file not found: ' . $filePath);
                } catch (\Exception $e) {
                    // Ignore logging errors
                }
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
            try {
                Log::error('Error downloading message file: ' . $e->getMessage());
                Log::error('Stack trace: ' . $e->getTraceAsString());
            } catch (\Exception $logException) {
                // Ignore logging errors
            }
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
            try {
                Log::error('Error in unreadCount: ' . $e->getMessage());
            } catch (\Exception $logException) {
                // Ignore logging errors
            }
            return response()->json(['count' => 0, 'error' => $e->getMessage()], 500);
        }
    }
}


