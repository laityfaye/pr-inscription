<?php

namespace App\Services;

use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class MessageService
{
    public function send(User $sender, User $receiver, string $content): Message
    {
        return Message::create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'content' => $content,
        ]);
    }

    public function getConversation(User $user1, User $user2): Collection
    {
        return Message::where(function ($query) use ($user1, $user2) {
            $query->where('sender_id', $user1->id)
                  ->where('receiver_id', $user2->id);
        })->orWhere(function ($query) use ($user1, $user2) {
            $query->where('sender_id', $user2->id)
                  ->where('receiver_id', $user1->id);
        })->with(['sender', 'receiver'])
          ->orderBy('created_at', 'asc')
          ->get();
    }

    public function markAsRead(Message $message): bool
    {
        return $message->update(['is_read' => true]);
    }

    public function getUnreadCount(User $user): int
    {
        return Message::where('receiver_id', $user->id)
            ->where('is_read', false)
            ->count();
    }
}














