<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceCorsHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
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
        
        // Gérer les requêtes OPTIONS (preflight)
        if ($request->getMethod() === 'OPTIONS') {
            return response('', 204)->withHeaders($corsHeaders);
        }
        
        try {
            $response = $next($request);
            
            // Ajouter les headers CORS à toutes les réponses
            foreach ($corsHeaders as $key => $value) {
                $response->headers->set($key, $value, true);
            }
            
            return $response;
        } catch (\Throwable $e) {
            // En cas d'exception, créer une réponse avec les headers CORS
            $errorResponse = response()->json([
                'message' => 'Une erreur est survenue',
                'error' => config('app.debug') ? $e->getMessage() : 'Une erreur interne est survenue',
            ], 500);
            
            // Ajouter les headers CORS même en cas d'erreur
            foreach ($corsHeaders as $key => $value) {
                $errorResponse->headers->set($key, $value, true);
            }
            
            // Re-lancer l'exception pour que le handler d'exceptions puisse la gérer
            throw $e;
        }
    }
}

