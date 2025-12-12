<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SlotPrice extends Model
{
    use HasFactory;

    protected $fillable = [
        'time',
        'price',
        'currency',
    ];

    protected $casts = [
        'time' => 'string',
        'price' => 'decimal:2',
    ];

    /**
     * Accessor pour s'assurer que time est toujours retourné comme string 'HH:MM' (sans secondes)
     */
    public function getTimeAttribute($value)
    {
        if (is_string($value)) {
            // Extraire seulement HH:MM si la string contient des secondes
            return substr($value, 0, 5);
        }
        
        if (is_object($value) && method_exists($value, 'format')) {
            return $value->format('H:i');
        }
        
        // Convertir en string et extraire HH:MM
        $timeStr = (string) $value;
        return substr($timeStr, 0, 5);
    }
}

