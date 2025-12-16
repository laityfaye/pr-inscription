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
        // Construire la requête de base pour les messages entre les deux utilisateurs
        // Si l'un des utilisateurs est un admin et l'autre un client,
        // inclure tous les messages entre le client et n'importe quel admin
        // (pour gérer le cas où il y a plusieurs admins dans la base)
        $query = Message::where(function ($q) use ($user1, $user2) {
            // Cas standard: Messages envoyés de user1 à user2 OU de user2 à user1
            $q->where(function ($subQ) use ($user1, $user2) {
                $subQ->where('sender_id', $user1->id)
                      ->where('receiver_id', $user2->id);
            })
            ->orWhere(function ($subQ) use ($user1, $user2) {
                $subQ->where('sender_id', $user2->id)
                      ->where('receiver_id', $user1->id);
            });
            
            // Si l'un des utilisateurs est un admin et l'autre un client,
            // inclure aussi les messages entre le client et n'importe quel admin
            if (($user1->isAdmin() && $user2->role === 'client') || 
                ($user2->isAdmin() && $user1->role === 'client')) {
                $clientId = $user1->isAdmin() ? $user2->id : $user1->id;
                
                // Messages envoyés par le client à n'importe quel admin
                $q->orWhere(function ($subQ) use ($clientId) {
                    $subQ->where('sender_id', $clientId)
                          ->whereIn('receiver_id', function ($query) {
                              $query->select('id')
                                    ->from('users')
                                    ->where('role', 'admin');
                          });
                })
                // Messages envoyés par n'importe quel admin au client
                ->orWhere(function ($subQ) use ($clientId) {
                    $subQ->where('receiver_id', $clientId)
                          ->whereIn('sender_id', function ($query) {
                              $query->select('id')
                                    ->from('users')
                                    ->where('role', 'admin');
                          });
                });
            }
        });
        
        // Si un type d'application est spécifié, filtrer pour inclure:
        // 1. Les messages généraux (sans application)
        // 2. Les messages de cette application spécifique
        // IMPORTANT: Appliquer ce filtre comme une condition AND supplémentaire
        if ($applicationType && $applicationId) {
            $query->where(function ($appQ) use ($applicationType, $applicationId) {
                // Messages généraux (sans application)
                $appQ->where(function ($generalQ) {
                    $generalQ->whereNull('application_type')
                             ->whereNull('inscription_id')
                             ->whereNull('work_permit_application_id')
                             ->whereNull('residence_application_id');
                });
                
                // OU messages de cette application spécifique
                if ($applicationType === 'inscription') {
                    $appQ->orWhere('inscription_id', $applicationId);
                } elseif ($applicationType === 'work_permit') {
                    $appQ->orWhere('work_permit_application_id', $applicationId);
                } elseif ($applicationType === 'residence') {
                    $appQ->orWhere('residence_application_id', $applicationId);
                }
            });
        }

        // Charger seulement les nouveaux messages si sinceId est fourni
        if ($sinceId) {
            $query->where('id', '>', $sinceId);
        }

        // Optimiser : charger seulement les relations nécessaires
        // Utiliser with() avec un callback pour gérer les cas où les relations n'existent pas
        $query->with([
            'sender' => function ($q) {
                $q->select('id', 'name', 'email');
            },
            'receiver' => function ($q) {
                $q->select('id', 'name', 'email');
            }
        ]);

        // Si on charge depuis le début, charger les relations d'application
        if (!$sinceId) {
            $query->with([
                'inscription' => function ($q) {
                    $q->select('id', 'country_id');
                },
                'workPermitApplication' => function ($q) {
                    $q->select('id', 'work_permit_country_id');
                },
                'residenceApplication' => function ($q) {
                    $q->select('id');
                }
            ]);
        }

        // Log pour debug (à retirer en production)
        try {
            // Test direct : vérifier combien de messages existent dans la base pour cette conversation
            try {
                $allMessagesCount = Message::where(function ($q) use ($user1, $user2) {
                    $q->whereRaw('(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)', [
                        $user1->id, $user2->id,
                        $user2->id, $user1->id
                    ]);
                })->count();
                
                $sentByUser1Count = Message::where('sender_id', $user1->id)
                    ->where('receiver_id', $user2->id)
                    ->count();
                
                $sentByUser2Count = Message::where('sender_id', $user2->id)
                    ->where('receiver_id', $user1->id)
                    ->count();
                
                Log::debug('Message counts in database', [
                    'user1_id' => $user1->id,
                    'user2_id' => $user2->id,
                    'total_messages' => $allMessagesCount,
                    'sent_by_user1' => $sentByUser1Count,
                    'sent_by_user2' => $sentByUser2Count,
                ]);
            } catch (\Exception $logException) {
                // Ignore logging errors
            }
            
            // Log la requête SQL générée pour déboguer
            try {
                $sql = $query->toSql();
                $bindings = $query->getBindings();
                Log::debug('Message query SQL', [
                    'sql' => $sql,
                    'bindings' => $bindings,
                    'user1_id' => $user1->id,
                    'user2_id' => $user2->id,
                ]);
            } catch (\Exception $logException) {
                // Ignore logging errors
            }
            
            // Si un limit est fourni, récupérer les messages les plus récents, puis les trier par date croissante
            if ($limit && !$sinceId) {
                // Récupérer les messages les plus récents d'abord
                $result = $query->orderBy('created_at', 'desc')
                                ->orderBy('id', 'desc')
                                ->limit($limit)
                                ->get()
                                ->sortBy(function($message) {
                                    return $message->created_at;
                                })
                                ->values();
            } else {
                // Sinon, récupérer tous les messages triés par date croissante
                $result = $query->orderBy('created_at', 'asc')
                                ->orderBy('id', 'asc')
                                ->get();
            }
            
            try {
                // Log détaillé pour vérifier que tous les messages sont retournés
                $messageDetails = $result->map(function($msg) {
                    return [
                        'id' => $msg->id,
                        'sender_id' => $msg->sender_id,
                        'receiver_id' => $msg->receiver_id,
                        'created_at' => $msg->created_at,
                        'application_type' => $msg->application_type,
                    ];
                })->toArray();
                
                Log::debug('Message query result', [
                    'user1_id' => $user1->id,
                    'user2_id' => $user2->id,
                    'application_type' => $applicationType,
                    'application_id' => $applicationId,
                    'since_id' => $sinceId,
                    'limit' => $limit,
                    'result_count' => $result->count(),
                    'messages' => $messageDetails,
                ]);
            } catch (\Exception $logException) {
                // Ignore logging errors
            }

            return $result;
        } catch (\Exception $e) {
            try {
                Log::error('Error in getConversation: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                    'user1_id' => $user1->id,
                    'user2_id' => $user2->id,
                ]);
            } catch (\Exception $logException) {
                // Ignore logging errors
            }
            // Retourner une collection vide en cas d'erreur
            return new \Illuminate\Database\Eloquent\Collection();
        }
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
            try {
                Log::error('Error in getUnreadCount: ' . $e->getMessage());
            } catch (\Exception $logException) {
                // Ignore logging errors
            }
            return 0;
        }
    }
}














