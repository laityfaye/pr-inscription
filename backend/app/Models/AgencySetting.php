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
        'lawyer_card_enabled',
        'lawyer_first_name',
        'lawyer_last_name',
        'lawyer_title',
        'lawyer_image',
        'lawyer_phone',
        'lawyer_email',
    ];

    protected function casts(): array
    {
        return [
            'social_links' => 'array',
            'lawyer_card_enabled' => 'boolean',
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



