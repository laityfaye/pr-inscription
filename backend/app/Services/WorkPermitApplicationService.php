<?php

namespace App\Services;

use App\Models\WorkPermitApplication;
use App\Repositories\WorkPermitApplicationRepository;

class WorkPermitApplicationService
{
    public function __construct(
        private WorkPermitApplicationRepository $repository
    ) {}

    public function create(array $data): WorkPermitApplication
    {
        $data['status'] = 'pending';
        $data['submitted_at'] = now();
        return $this->repository->create($data);
    }

    public function updateStatus(WorkPermitApplication $application, string $status, ?string $notes = null, ?string $rejectionReason = null): bool
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

    public function notifyClient(WorkPermitApplication $application): bool
    {
        return $this->repository->update($application, [
            'client_notified_at' => now(),
        ]);
    }
}

