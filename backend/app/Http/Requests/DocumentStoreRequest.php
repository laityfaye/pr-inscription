<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

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
        
        foreach (['inscription_id', 'work_permit_application_id', 'residence_application_id', 'study_permit_renewal_application_id'] as $field) {
            if ($this->has($field)) {
                $value = $this->input($field);
                if ($value === '' || $value === null || (is_string($value) && trim($value) === '')) {
                    $dataToMerge[$field] = null;
                } elseif (is_numeric($value)) {
                    $dataToMerge[$field] = (int) $value;
                } else {
                    // Si ce n'est pas numérique et pas vide, le mettre à null
                    $dataToMerge[$field] = null;
                }
            }
        }
        
        if (!empty($dataToMerge)) {
            $this->merge($dataToMerge);
        }
        
        // Logger les données reçues pour debug
        try {
            Log::info('Document upload request data:', [
                'has_file' => $this->hasFile('file'),
                'file_size' => $this->hasFile('file') ? $this->file('file')->getSize() : null,
                'type' => $this->input('type'),
                'inscription_id' => $this->input('inscription_id'),
                'work_permit_application_id' => $this->input('work_permit_application_id'),
                'residence_application_id' => $this->input('residence_application_id'),
                'study_permit_renewal_application_id' => $this->input('study_permit_renewal_application_id'),
                'name' => $this->input('name'),
            ]);
        } catch (\Exception $e) {
            // Si le logging échoue, continuer quand même
            error_log('Failed to log document upload request: ' . $e->getMessage());
        }
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:10240'], // 10MB max (en KB)
            'type' => ['required', 'string'],
            'inscription_id' => ['nullable', 'integer'],
            'work_permit_application_id' => ['nullable', 'integer'],
            'residence_application_id' => ['nullable', 'integer'],
            'study_permit_renewal_application_id' => ['nullable', 'integer'],
            'name' => ['nullable', 'string', 'max:255'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'], // Permettre à l'admin de spécifier un user_id
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
            'study_permit_renewal_application_id.integer' => 'L\'ID de demande de renouvellement CAQ/Permis d\'études doit être un nombre.',
            'study_permit_renewal_application_id.exists' => 'La demande de renouvellement CAQ/Permis d\'études sélectionnée n\'existe pas.',
        ];
    }
}