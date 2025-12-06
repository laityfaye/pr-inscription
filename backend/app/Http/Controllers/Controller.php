<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Http\Request;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Get CORS headers for API responses
     */
    protected function getCorsHeaders(Request $request): array
    {
        $allowedOrigins = [
            'https://sbcgroupe.ca',
            'https://www.sbcgroupe.ca',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
        ];
        
        $origin = $request->header('Origin');
        $corsHeaders = [];
        
        if (in_array($origin, $allowedOrigins)) {
            $corsHeaders['Access-Control-Allow-Origin'] = $origin;
        } elseif (!empty($allowedOrigins)) {
            $corsHeaders['Access-Control-Allow-Origin'] = $allowedOrigins[0];
        }
        
        $corsHeaders['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
        $corsHeaders['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, Accept, X-Requested-With';
        $corsHeaders['Access-Control-Allow-Credentials'] = 'true';
        
        return $corsHeaders;
    }
}

