<?php

namespace App\Repositories;

use App\Models\StudyPermitRenewalApplication;
use Illuminate\Database\Eloquent\Collection;

class StudyPermitRenewalApplicationRepository
{
    public function find(int $id): ?StudyPermitRenewalApplication
    {
        return StudyPermitRenewalApplication::with(['user', 'documents.validator'])->find($id);
    }

    public function getByUser(int $userId, bool $minimal = false): Collection
    {
        $query = StudyPermitRenewalApplication::where('user_id', $userId);
        
        if (!$minimal) {
            $query->with(['documents.validator']);
        }
        
        return $query->orderBy('created_at', 'desc')->get();
    }

    public function getAll(array $filters = []): Collection
    {
        $query = StudyPermitRenewalApplication::with(['user', 'documents.validator']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function create(array $data): StudyPermitRenewalApplication
    {
        return StudyPermitRenewalApplication::create($data);
    }

    public function update(StudyPermitRenewalApplication $application, array $data): bool
    {
        return $application->update($data);
    }

    public function delete(StudyPermitRenewalApplication $application): bool
    {
        return $application->delete();
    }
}

