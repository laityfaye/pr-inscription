<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DocumentStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // Convertir les chaînes vides en null pour les IDs optionnels
        $dataToMerge = [];
        
        foreach (['inscription_id', 'work_permit_application_id', 'residence_application_id'] as $field) {
            if ($this->has($field)) {
                $value = $this->input($field);
                if ($value === '' || $value === null || (is_string($value) && trim($value) === '')) {
                    $dataToMerge[$field] = null;
                } elseif (is_numeric($value)) {
                    $dataToMerge[$field] = (int) $value;
                }
            }
        }
        
        if (!empty($dataToMerge)) {
            $this->merge($dataToMerge);
        }
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:10240'], // 10MB max (en KB)
            'type' => ['required', 'string'],
            'inscription_id' => ['nullable', 'integer', 'exists:inscriptions,id'],
            'work_permit_application_id' => ['nullable', 'integer', 'exists:work_permit_applications,id'],
            'residence_application_id' => ['nullable', 'integer', 'exists:residence_applications,id'],
            'name' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Le fichier est requis.',
            'file.file' => 'Le fichier doit être un fichier valide.',
            'file.max' => 'Le fichier ne doit pas dépasser 10 MB.',
            'type.required' => 'Le type de document est requis.',
            'inscription_id.integer' => 'L\'ID de préinscription doit être un nombre.',
            'inscription_id.exists' => 'La préinscription sélectionnée n\'existe pas.',
            'work_permit_application_id.integer' => 'L\'ID de demande de permis de travail doit être un nombre.',
            'work_permit_application_id.exists' => 'La demande de permis de travail sélectionnée n\'existe pas.',
            'residence_application_id.integer' => 'L\'ID de demande de résidence doit être un nombre.',
            'residence_application_id.exists' => 'La demande de résidence sélectionnée n\'existe pas.',
        ];
    }
}