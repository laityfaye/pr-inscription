<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class AgencyUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    protected function prepareForValidation(): void
    {
        $dataToMerge = [];
        
        // Convertir les chaînes vides en null pour les champs nullable
        $nullableFields = [
            'name',
            'description',
            'hero_subtitle',
            'email',
            'whatsapp',
            'phone',
            'address',
            'registration_number',
            'lawyer_first_name',
            'lawyer_last_name',
            'lawyer_title',
            'lawyer_phone',
            'lawyer_email',
        ];
        
        foreach ($nullableFields as $field) {
            if ($this->has($field)) {
                $value = $this->input($field);
                if ($value === '' || (is_string($value) && trim($value) === '')) {
                    $dataToMerge[$field] = null;
                }
            }
        }
        
        // Traiter lawyer_card_enabled - toujours le définir
        if ($this->has('lawyer_card_enabled')) {
            $value = $this->input('lawyer_card_enabled');
            if ($value === '' || $value === null || $value === false || $value === 'false' || $value === '0') {
                $dataToMerge['lawyer_card_enabled'] = false;
            } elseif (is_string($value)) {
                $dataToMerge['lawyer_card_enabled'] = in_array(strtolower($value), ['true', '1', 'on', 'yes'], true);
            } else {
                $dataToMerge['lawyer_card_enabled'] = (bool) $value;
            }
        } else {
            // Si le champ n'est pas présent, le mettre à false
            $dataToMerge['lawyer_card_enabled'] = false;
        }
        
        if (!empty($dataToMerge)) {
            $this->merge($dataToMerge);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'max:25600'], // 25MB max (en KB) pour correspondre à Nginx
            'description' => ['nullable', 'string'],
            'hero_subtitle' => ['nullable', 'string', 'max:500'],
            'email' => ['nullable', 'string', 'max:255'],
            'whatsapp' => ['nullable', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'registration_number' => ['nullable', 'string', 'max:100'],
            'lawyer_card_enabled' => ['nullable'],
            'lawyer_first_name' => ['nullable', 'string', 'max:255'],
            'lawyer_last_name' => ['nullable', 'string', 'max:255'],
            'lawyer_title' => ['nullable', 'string', 'max:255'],
            'lawyer_image' => ['nullable', 'image', 'max:25600'], // 25MB max (en KB) pour correspondre à Nginx
            'lawyer_phone' => ['nullable', 'string', 'max:50'],
            'lawyer_email' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.email' => 'L\'email doit être une adresse email valide.',
            'lawyer_email.email' => 'L\'email de l\'avocat doit être une adresse email valide.',
            'logo.image' => 'Le logo doit être une image.',
            'logo.max' => 'Le logo ne doit pas dépasser 25 MB.',
            'lawyer_image.image' => 'L\'image de l\'avocat doit être une image.',
            'lawyer_image.max' => 'L\'image de l\'avocat ne doit pas dépasser 25 MB.',
        ];
    }
}

