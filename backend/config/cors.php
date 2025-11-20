<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'], // Permet toutes les origines (pour développement)
    // Pour la production, utilisez plutôt :
    // 'allowed_origins' => ['http://localhost:3000', 'http://127.0.0.1:3000', env('FRONTEND_URL', 'http://localhost:3000')],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];



