<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class UserRepository
{
    public function find(int $id): ?User
    {
        return User::find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function getAllClients(array $filters = []): Collection
    {
        $query = User::where('role', 'client')->with(['inscriptions', 'documents']);

        // Recherche par nom ou email
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        // Filtre par pays visé
        if (!empty($filters['target_country'])) {
            $query->where('target_country', $filters['target_country']);
        }

        // Filtre par téléphone (avec/sans téléphone)
        if (isset($filters['has_phone'])) {
            if ($filters['has_phone']) {
                $query->whereNotNull('phone')->where('phone', '!=', '');
            } else {
                $query->where(function($q) {
                    $q->whereNull('phone')->orWhere('phone', '');
                });
            }
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(User $user, array $data): bool
    {
        return $user->update($data);
    }

    public function delete(User $user): bool
    {
        return $user->delete();
    }
}



