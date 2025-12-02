<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UnavailableDay extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'reason',
    ];

    protected $casts = [
        'date' => 'date',
    ];
}

