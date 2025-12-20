<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudyPermitRenewalApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'notes',
        'rejection_reason',
        'client_notified_at',
        'submitted_at',
        'arrival_date',
        'institution_name',
        'expiration_date',
        'address',
        'address_number',
        'country',
    ];

    protected $casts = [
        'client_notified_at' => 'datetime',
        'submitted_at' => 'datetime',
        'arrival_date' => 'date',
        'expiration_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class, 'study_permit_renewal_application_id');
    }
}

