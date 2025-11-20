<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgencySetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'logo',
        'description',
        'hero_subtitle',
        'email',
        'whatsapp',
        'phone',
        'address',
        'registration_number',
        'social_links',
    ];

    protected function casts(): array
    {
        return [
            'social_links' => 'array',
        ];
    }

    public static function getSettings()
    {
        return static::first() ?? static::create([
            'name' => 'TFKS Touba Fall Khidma Services',
            'description' => 'Votre destination, notre mission',
            'hero_subtitle' => 'Transformez votre rêve d\'études à l\'étranger en réalité avec notre accompagnement expert',
            'email' => 'toubafallv@gmail.com',
            'phone' => '789553756',
            'address' => 'Dakar, HLM FASS',
            'registration_number' => 'SN.DKR.2025.A.34574',
        ]);
    }
}



