<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NewsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
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


