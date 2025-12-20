<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAvocatOrAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user || (!$user->isAvocat() && !$user->isAdmin())) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return $next($request);
    }
}

