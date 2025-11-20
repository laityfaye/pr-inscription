<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'inscription_id',
        'country_obtained',
        'content',
        'rating',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function inscription()
    {
        return $this->belongsTo(Inscription::class);
    }
}











