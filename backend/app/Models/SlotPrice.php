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
     * Mutator pour s'assurer que time est toujours sauvegardé au bon format
     */
    public function setTimeAttribute($value)
    {
        if (is_string($value)) {
            // Si c'est déjà au format HH:MM:SS, utiliser tel quel
            if (strlen($value) === 8) {
                $this->attributes['time'] = $value;
            } 
            // Si c'est au format HH:MM, ajouter :00
            elseif (strlen($value) === 5) {
                $this->attributes['time'] = $value . ':00';
            } else {
                $this->attributes['time'] = $value;
            }
        } else {
            $this->attributes['time'] = $value;
        }
    }

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

