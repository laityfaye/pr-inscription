<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'date',
        'time',
        'message',
        'payment_proof',
        'status',
        'amount',
        'rejection_reason',
        'validated_by',
        'validated_at',
    ];

    protected $casts = [
        'date' => 'date',
        'time' => 'string',
        'validated_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    public function validator()
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeValidated($query)
    {
        return $query->where('status', 'validated');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}

