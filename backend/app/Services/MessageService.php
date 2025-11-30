<?php

namespace App\Services;

use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

class MessageService
{
    public function send(User $sender, User $receiver, string $content, ?string $applicationType = null, ?int $applicationId = null, ?string $statusUpdate = null, ?string $filePath = null, ?string $fileName = null, ?string $fileType = null, ?int $fileSize = null): Message
    {
        $data = [
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'content' => $content,
        ];

        if ($applicationType) {
            $data['application_type'] = $applicationType;
            if ($applicationType === 'inscription' && $applicationId) {
                $data['inscription_id'] = $applicationId;
            } elseif ($applicationType === 'work_permit' && $applicationId) {
                $data['work_permit_application_id'] = $applicationId;
            } elseif ($applicationType === 'residence' && $applicationId) {
                $data['residence_application_id'] = $applicationId;
            }
        }

        if ($statusUpdate) {
            $data['status_update'] = $statusUpdate;
        }

        if ($filePath) {
            $data['file_path'] = $filePath;
            $data['file_name'] = $fileName;
            $data['file_type'] = $fileType;
            $data['file_size'] = $fileSize;
        }

        return Message::create($data);
    }

    public function getConversation(User $user1, User $user2, ?string $applicationType = null, ?int $applicationId = null, ?int $sinceId = null, ?int $limit = null): Collection
    {
        $query = Message::where(function ($q) use ($user1, $user2) {
            $q->where('sender_id', $user1->id)
              ->where('receiver_id', $user2->id);
        })->orWhere(function ($q) use ($user1, $user2) {
            $q->where('sender_id', $user2->id)
              ->where('receiver_id', $user1->id);
        });

        if ($applicationType && $applicationId) {
            if ($applicationType === 'inscription') {
                $query->where('inscription_id', $applicationId);
            } elseif ($applicationType === 'work_permit') {
                $query->where('work_permit_application_id', $applicationId);
            } elseif ($applicationType === 'residence') {
                $query->where('residence_application_id', $applicationId);
            }
        }

        // Charger seulement les nouveaux messages si sinceId est fourni
        if ($sinceId) {
            $query->where('id', '>', $sinceId);
        }

        // Limiter le nombre de résultats si limit est fourni
        if ($limit) {
            $query->limit($limit);
        }

        // Optimiser : charger seulement les relations nécessaires
        $query->with(['sender:id,name,email', 'receiver:id,name,email']);

        // Si on charge depuis le début, charger les relations d'application
        if (!$sinceId) {
            $query->with(['inscription:id,country_id', 'workPermitApplication:id,work_permit_country_id', 'residenceApplication:id']);
        }

        return $query->orderBy('created_at', 'asc')
          ->get();
    }

    public function markAsRead(Message $message): bool
    {
        return $message->update(['is_read' => true]);
    }

    public function getUnreadCount(User $user): int
    {
        try {
            return Message::where('receiver_id', $user->id)
                ->where('is_read', 0)
                ->count();
        } catch (\Exception $e) {
            Log::error('Error in getUnreadCount: ' . $e->getMessage());
            return 0;
        }
    }
}














