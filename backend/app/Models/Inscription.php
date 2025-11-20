<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'country_id',
        'status',
        'notes',
        'client_notified_at',
        'current_education_level',
        'current_field',
        'requested_education_level',
        'requested_field',
    ];

    protected $casts = [
        'client_notified_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }
}








