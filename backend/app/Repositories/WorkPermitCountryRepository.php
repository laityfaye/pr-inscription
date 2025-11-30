<?php

namespace App\Repositories;

use App\Models\WorkPermitCountry;
use Illuminate\Database\Eloquent\Collection;

class WorkPermitCountryRepository
{
    public function find(int $id): ?WorkPermitCountry
    {
        return WorkPermitCountry::find($id);
    }

    public function getAll(): Collection
    {
        return WorkPermitCountry::orderBy('name')->get();
    }

    public function getActive(): Collection
    {
        return WorkPermitCountry::where('is_active', true)->orderBy('name')->get();
    }

    public function create(array $data): WorkPermitCountry
    {
        return WorkPermitCountry::create($data);
    }

    public function update(WorkPermitCountry $country, array $data): bool
    {
        return $country->update($data);
    }

    public function delete(WorkPermitCountry $country): bool
    {
        return $country->delete();
    }
}

