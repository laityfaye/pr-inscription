<?php

namespace App\Repositories;

use App\Models\Review;
use Illuminate\Database\Eloquent\Collection;

class ReviewRepository
{
    public function find(int $id): ?Review
    {
        return Review::with(['user', 'inscription'])->find($id);
    }

    public function getApproved(): Collection
    {
        return Review::where('status', 'approved')
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getAll(): Collection
    {
        return Review::with(['user', 'inscription'])->orderBy('created_at', 'desc')->get();
    }

    public function create(array $data): Review
    {
        return Review::create($data);
    }

    public function update(Review $review, array $data): bool
    {
        return $review->update($data);
    }

    public function delete(Review $review): bool
    {
        return $review->delete();
    }
}











