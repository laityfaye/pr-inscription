<?php

namespace App\Services;

use App\Models\StudyPermitRenewalApplication;
use App\Repositories\StudyPermitRenewalApplicationRepository;

class StudyPermitRenewalApplicationService
{
    public function __construct(
        private StudyPermitRenewalApplicationRepository $repository
    ) {}

    public function create(array $data): StudyPermitRenewalApplication
    {
        $data['status'] = 'pending';
        $data['submitted_at'] = now();
        $data['country'] = $data['country'] ?? 'Canada';
        return $this->repository->create($data);
    }

    public function updateStatus(StudyPermitRenewalApplication $application, string $status, ?string $notes = null, ?string $rejectionReason = null): bool
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

    public function notifyClient(StudyPermitRenewalApplication $application): bool
    {
        return $this->repository->update($application, [
            'client_notified_at' => now(),
        ]);
    }
}

