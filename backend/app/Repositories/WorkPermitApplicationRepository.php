<?php

namespace App\Repositories;

use App\Models\WorkPermitApplication;
use Illuminate\Database\Eloquent\Collection;

class WorkPermitApplicationRepository
{
    public function find(int $id): ?WorkPermitApplication
    {
        return WorkPermitApplication::with(['user', 'country', 'documents.validator'])->find($id);
    }

    public function getByUser(int $userId, bool $minimal = false): Collection
    {
        $query = WorkPermitApplication::where('user_id', $userId);
        
        if ($minimal) {
            $query->with(['country:id,name']);
        } else {
            $query->with(['country', 'documents.validator']);
        }
        
        return $query->orderBy('created_at', 'desc')->get();
    }

    public function getAll(array $filters = []): Collection
    {
        $query = WorkPermitApplication::with(['user', 'country', 'documents.validator']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['work_permit_country_id'])) {
            $query->where('work_permit_country_id', $filters['work_permit_country_id']);
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

    public function create(array $data): WorkPermitApplication
    {
        return WorkPermitApplication::create($data);
    }

    public function update(WorkPermitApplication $application, array $data): bool
    {
        return $application->update($data);
    }

    public function delete(WorkPermitApplication $application): bool
    {
        return $application->delete();
    }
}

