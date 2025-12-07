<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\NewsRequest;
use App\Models\News;
use App\Repositories\NewsRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class NewsController extends Controller
{
    public function __construct(
        private NewsRepository $newsRepository
    ) {}

    public function index(Request $request): JsonResponse
    {
        if ($request->user()?->isAdmin() && $request->has('all')) {
            $news = $this->newsRepository->getAll();
        } else {
            $news = $this->newsRepository->getPublished();
        }

        return response()->json($news)
            ->withHeaders($this->getCorsHeaders($request));
    }

    public function store(NewsRequest $request): JsonResponse
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Non authentifié'], 401)
                ->withHeaders($this->getCorsHeaders($request));
        }

        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403)
                ->withHeaders($this->getCorsHeaders($request));
        }

        try {
            $data = $request->validated();
            $data['user_id'] = $request->user()->id;

            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $path = $file->store('news', 'public');
                $data['image'] = $path;
                // Logger seulement si possible (ne pas faire échouer la requête si le logging échoue)
                try {
                    Log::info('Image uploaded:', [
                        'path' => $path, 
                        'original_name' => $file->getClientOriginalName(),
                        'size' => $file->getSize(),
                        'mime' => $file->getMimeType()
                    ]);
                } catch (\Exception $logError) {
                    // Ignorer les erreurs de logging
                }
            }

            $news = $this->newsRepository->create($data);

            return response()->json($news->load('user'), 201)
                ->withHeaders($this->getCorsHeaders($request));
        } catch (\Exception $e) {
            // Logger seulement si possible (ne pas faire échouer la requête si le logging échoue)
            try {
                Log::error('Error creating news:', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'data' => $data ?? null,
                ]);
            } catch (\Exception $logError) {
                // Ignorer les erreurs de logging - utiliser error_log comme fallback
                error_log('Error creating news: ' . $e->getMessage());
            }
            
            return response()->json([
                'message' => 'Erreur lors de la création',
                'error' => config('app.debug') ? $e->getMessage() : 'Une erreur interne est survenue',
            ], 500)->withHeaders($this->getCorsHeaders($request));
        }
    }

    public function show(Request $request, News $news): JsonResponse
    {
        return response()->json($news->load('user'))
            ->withHeaders($this->getCorsHeaders($request));
    }

    public function update(NewsRequest $request, News $news): JsonResponse
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403)
                ->withHeaders($this->getCorsHeaders($request));
        }

        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($news->image) {
                Storage::disk('public')->delete($news->image);
            }
            $data['image'] = $request->file('image')->store('news', 'public');
        }

        $this->newsRepository->update($news, $data);

        return response()->json($news->fresh()->load('user'))
            ->withHeaders($this->getCorsHeaders($request));
    }

    public function destroy(Request $request, News $news): JsonResponse
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403)
                ->withHeaders($this->getCorsHeaders($request));
        }

        if ($news->image) {
            Storage::disk('public')->delete($news->image);
        }

        $this->newsRepository->delete($news);

        return response()->json(['message' => 'Actualité supprimée'])
            ->withHeaders($this->getCorsHeaders($request));
    }
}


