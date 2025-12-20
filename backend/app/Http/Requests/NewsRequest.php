<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class NewsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function failedValidation(Validator $validator)
    {
        $allowedOrigins = [
            'https://tfksservice.innosft.com',
            'https://www.tfksservice.innosft.com',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
        ];
        
        $origin = $this->header('Origin');
        $corsHeaders = [];
        
        if (in_array($origin, $allowedOrigins)) {
            $corsHeaders['Access-Control-Allow-Origin'] = $origin;
        } elseif (!empty($allowedOrigins)) {
            $corsHeaders['Access-Control-Allow-Origin'] = $allowedOrigins[0];
        }
        
        $corsHeaders['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
        $corsHeaders['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, Accept, X-Requested-With';
        $corsHeaders['Access-Control-Allow-Credentials'] = 'true';

        throw new HttpResponseException(
            response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422)->withHeaders($corsHeaders)
        );
    }

    public function rules(): array
    {
        $rules = [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'image' => ['nullable', 'image', 'max:2048'],
            'video_type' => ['nullable', 'in:youtube,file'],
            'is_published' => ['nullable', 'boolean'],
        ];

        // Si video_url est fourni et non vide, il doit être une URL valide
        if ($this->filled('video_url')) {
            $rules['video_url'] = ['required', 'string', 'url'];
        } else {
            $rules['video_url'] = ['nullable', 'string'];
        }

        return $rules;
    }

    protected function prepareForValidation(): void
    {
        // Convertir is_published en booléen si c'est une chaîne
        if ($this->has('is_published')) {
            $value = $this->input('is_published');
            if (is_string($value)) {
                $this->merge([
                    'is_published' => in_array(strtolower($value), ['1', 'true', 'on', 'yes']),
                ]);
            }
        }

        // Nettoyer video_url si vide
        if ($this->has('video_url') && empty(trim($this->input('video_url', '')))) {
            $this->merge(['video_url' => null]);
        }
    }
}


