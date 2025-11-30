<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkPermitCountry extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'subtitle',
        'code',
        'flag',
        'description',
        'eligibility_conditions',
        'required_documents',
        'application_process',
        'processing_time',
        'costs',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function applications()
    {
        return $this->hasMany(WorkPermitApplication::class);
    }
}

