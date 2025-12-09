<?php

use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\ForceCorsHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
        ]);
        
        // Ajouter CORS en premier pour toutes les requêtes API
        // Utiliser notre middleware personnalisé qui garantit les headers CORS
        $middleware->api(prepend: [
            ForceCorsHeaders::class,
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Fonction helper pour obtenir les headers CORS
        $getCorsHeaders = function ($request) {
            $allowedOrigins = [
                'https://tfksservice.innosft.com',
                'https://tfksbackend.innosft.com',
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
        };
        
        // Handler pour toutes les exceptions
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) use ($getCorsHeaders) {
            // Pour les requêtes API, toujours retourner JSON avec headers CORS
            // Détecter les requêtes API de manière plus large
            try {
                $path = $request->path();
                $isApiRequest = str_starts_with($path, 'api/')
                    || $request->is('api/*')
                    || $request->expectsJson()
                    || $request->header('Accept') === 'application/json'
                    || $request->header('Content-Type') === 'application/json'
                    || str_contains($request->header('Content-Type', ''), 'multipart/form-data')
                    || $request->header('X-Requested-With') === 'XMLHttpRequest';
            } catch (\Exception $detectionError) {
                // Si la détection échoue, supposer que c'est une requête API si l'URL contient /api/
                $isApiRequest = str_contains($request->getRequestUri(), '/api/');
            }
            
            if ($isApiRequest) {
                $corsHeaders = $getCorsHeaders($request);
                
                // Logger l'erreur
                try {
                    \Illuminate\Support\Facades\Log::error('API Exception: ' . $e->getMessage(), [
                        'exception' => get_class($e),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                        'url' => $request->fullUrl(),
                        'method' => $request->method(),
                        'path' => $request->path(),
                    ]);
                } catch (\Exception $logError) {
                    // Si le logging échoue, continuer quand même
                }
                
                // Gérer les erreurs de validation
                if ($e instanceof \Illuminate\Validation\ValidationException) {
                    return response()->json([
                        'message' => 'Erreur de validation',
                        'errors' => $e->errors(),
                    ], 422)->withHeaders($corsHeaders);
                }
                
                // Gérer les erreurs d'autorisation
                if ($e instanceof \Illuminate\Auth\AuthenticationException || 
                    $e instanceof \Illuminate\Auth\Access\AuthorizationException) {
                    return response()->json([
                        'message' => 'Non autorisé',
                    ], 403)->withHeaders($corsHeaders);
                }
                
                // Retourner une réponse JSON avec headers CORS pour toutes les autres erreurs
                return response()->json([
                    'message' => 'Une erreur est survenue',
                    'error' => config('app.debug') ? $e->getMessage() : 'Une erreur interne est survenue',
                ], 500)->withHeaders($corsHeaders);
            }
            
            return null; // Laisser Laravel gérer les autres cas
        });
    })->create();











