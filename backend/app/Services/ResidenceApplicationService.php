<?php

namespace App\Services;

use App\Models\ResidenceApplication;
use App\Repositories\ResidenceApplicationRepository;

class ResidenceApplicationService
{
    public function __construct(
        private ResidenceApplicationRepository $repository
    ) {}

    public function create(array $data): ResidenceApplication
    {
        $data['status'] = 'pending';
        $data['submitted_at'] = now();
        return $this->repository->create($data);
    }

    public function updateStatus(ResidenceApplication $application, string $status, ?string $notes = null, ?string $rejectionReason = null): bool
    {
        $data = ['status' => $status];
        if ($notes) {
            $data['notes'] = $notes;
        }
        if ($rejectionReason) {
            $data['rejection_reason'] = $rejectionReason;
        }
        return $this->repository->update($application, $data);
    }

    public function getUserApplications(int $userId, bool $minimal = false)
    {
        return $this->repository->getByUser($userId, $minimal);
    }

    public function getAllApplications(array $filters = [])
    {
        return $this->repository->getAll($filters);
    }

    public function notifyClient(ResidenceApplication $application): bool
    {
        return $this->repository->update($application, [
            'client_notified_at' => now(),
        ]);
    }
}

