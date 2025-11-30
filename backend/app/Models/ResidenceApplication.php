<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResidenceApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'notes',
        'rejection_reason',
        'client_notified_at',
        'submitted_at',
        'current_residence_country',
        'residence_type',
        'family_members',
        'employment_status',
        'financial_situation',
    ];

    protected $casts = [
        'client_notified_at' => 'datetime',
        'submitted_at' => 'datetime',
        'family_members' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class, 'residence_application_id');
    }
}

