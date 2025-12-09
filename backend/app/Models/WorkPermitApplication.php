<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkPermitApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'work_permit_country_id',
        'visa_type',
        'status',
        'notes',
        'rejection_reason',
        'client_notified_at',
        'submitted_at',
        'age',
        'profession',
        'experience_years',
        'current_employer',
        'phone_number',
        'address',
        'education_level',
        'language_skills',
    ];

    protected $casts = [
        'client_notified_at' => 'datetime',
        'submitted_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function country()
    {
        return $this->belongsTo(WorkPermitCountry::class, 'work_permit_country_id');
    }

    public function documents()
    {
        return $this->hasMany(Document::class, 'work_permit_application_id');
    }
}

