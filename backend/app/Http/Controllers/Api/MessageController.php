<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use App\Services\MessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
                          ->where('is_read', false);
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

        $messages = $this->messageService->getConversation($currentUser, $user);

        // Marquer les messages comme lus
        Message::where('sender_id', $user->id)
            ->where('receiver_id', $currentUser->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'messages' => $messages,
            'other_user' => $user,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'receiver_id' => ['required', 'exists:users,id'],
            'content' => ['required', 'string'],
        ]);

        $receiver = User::findOrFail($request->receiver_id);

        $message = $this->messageService->send(
            $request->user(),
            $receiver,
            $request->input('content')
        );

        return response()->json($message->load(['sender', 'receiver']), 201);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = $this->messageService->getUnreadCount($request->user());

        return response()->json(['count' => $count]);
    }
}


