<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'content',
        'is_read',
        'application_type',
        'inscription_id',
        'work_permit_application_id',
        'residence_application_id',
        'status_update',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
        ];
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function inscription()
    {
        return $this->belongsTo(Inscription::class, 'inscription_id');
    }

    public function workPermitApplication()
    {
        return $this->belongsTo(WorkPermitApplication::class, 'work_permit_application_id');
    }

    public function residenceApplication()
    {
        return $this->belongsTo(ResidenceApplication::class, 'residence_application_id');
    }
}





