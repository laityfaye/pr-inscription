<?php

namespace App\Repositories;

use App\Models\Inscription;
use Illuminate\Database\Eloquent\Collection;

class InscriptionRepository
{
    public function find(int $id): ?Inscription
    {
        return Inscription::with(['user', 'country', 'documents'])->find($id);
    }

    public function getByUser(int $userId): Collection
    {
        return Inscription::where('user_id', $userId)
            ->with(['country', 'documents'])
            ->get();
    }

    public function getAll(array $filters = []): Collection
    {
        $query = Inscription::with(['user', 'country', 'documents']);

        // Filtre par statut
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filtre par pays
        if (!empty($filters['country_id'])) {
            $query->where('country_id', $filters['country_id']);
        }

        // Filtre par utilisateur
        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        // Filtre par date de début
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        // Filtre par date de fin
        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        // Recherche par nom ou email du client
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function create(array $data): Inscription
    {
        return Inscription::create($data);
    }

    public function update(Inscription $inscription, array $data): bool
    {
        return $inscription->update($data);
    }

    public function delete(Inscription $inscription): bool
    {
        return $inscription->delete();
    }
}



