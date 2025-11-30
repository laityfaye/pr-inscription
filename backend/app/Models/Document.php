<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'inscription_id',
        'work_permit_application_id',
        'residence_application_id',
        'type',
        'name',
        'file_path',
        'mime_type',
        'size',
        'status',
        'rejection_reason',
        'validated_at',
        'validated_by',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function inscription()
    {
        return $this->belongsTo(Inscription::class);
    }

    public function workPermitApplication()
    {
        return $this->belongsTo(WorkPermitApplication::class);
    }

    public function residenceApplication()
    {
        return $this->belongsTo(ResidenceApplication::class);
    }

    public function validator()
    {
        return $this->belongsTo(User::class, 'validated_by');
    }
}











