<?php

namespace App\Services;

use App\Models\Inscription;
use App\Repositories\InscriptionRepository;

class InscriptionService
{
    public function __construct(
        private InscriptionRepository $inscriptionRepository
    ) {}

    public function create(array $data): Inscription
    {
        return $this->inscriptionRepository->create($data);
    }

    public function updateStatus(Inscription $inscription, string $status, ?string $notes = null): bool
    {
        $data = ['status' => $status];
        if ($notes) {
            $data['notes'] = $notes;
        }
        return $this->inscriptionRepository->update($inscription, $data);
    }

    public function getUserInscriptions(int $userId, bool $minimal = false)
    {
        return $this->inscriptionRepository->getByUser($userId, $minimal);
    }

    public function getAllInscriptions(array $filters = [])
    {
        return $this->inscriptionRepository->getAll($filters);
    }
}



