<?php

namespace App\Repositories;

use App\Models\News;
use Illuminate\Database\Eloquent\Collection;

class NewsRepository
{
    public function find(int $id): ?News
    {
        return News::with('user')->find($id);
    }

    public function getPublished(): Collection
    {
        return News::where('is_published', true)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getAll(): Collection
    {
        return News::with('user')->orderBy('created_at', 'desc')->get();
    }

    public function create(array $data): News
    {
        return News::create($data);
    }

    public function update(News $news, array $data): bool
    {
        return $news->update($data);
    }

    public function delete(News $news): bool
    {
        return $news->delete();
    }
}











