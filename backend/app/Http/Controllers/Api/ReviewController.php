<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewRequest;
use App\Models\Review;
use App\Repositories\ReviewRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct(
        private ReviewRepository $reviewRepository
    ) {}

    public function index(Request $request): JsonResponse
    {
        // Si l'utilisateur est admin (route /reviews/all), retourner tous les avis
        // Sinon, retourner uniquement les avis approuvés (route publique /reviews)
        if ($request->user()?->isAdmin()) {
            $reviews = $this->reviewRepository->getAll();
        } else {
            $reviews = $this->reviewRepository->getApproved();
        }

        return response()->json($reviews);
    }

    public function store(ReviewRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        $data['status'] = 'pending';

        // Vérifier si l'utilisateur a une inscription validée
        $validatedInscription = $request->user()
            ->inscriptions()
            ->where('status', 'validated')
            ->first();

        if ($validatedInscription) {
            $data['inscription_id'] = $validatedInscription->id;
            $data['country_obtained'] = $validatedInscription->country->name;
        }

        $review = $this->reviewRepository->create($data);

        return response()->json($review->load('user'), 201);
    }

    public function updateStatus(Request $request, Review $review): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'status' => ['required', 'in:pending,approved,rejected'],
        ]);

        $this->reviewRepository->update($review, ['status' => $request->status]);

        return response()->json([
            'message' => 'Statut mis à jour',
            'review' => $review->fresh()->load('user'),
        ]);
    }

    public function destroy(Request $request, Review $review): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $this->reviewRepository->delete($review);

        return response()->json(['message' => 'Avis supprimé']);
    }
}

