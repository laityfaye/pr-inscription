<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    // Pour la production, autoriser uniquement le domaine frontend
    'allowed_origins' => [
        'https://tfksservice.innosft.com',
        'https://tfksbackend.innosft.com',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];



