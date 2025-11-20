<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        private UserRepository $userRepository
    ) {}

    public function index(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $filters = [];
        
        if ($request->has('search') && !empty($request->input('search'))) {
            $filters['search'] = $request->input('search');
        }
        
        if ($request->has('target_country') && !empty($request->input('target_country'))) {
            $filters['target_country'] = $request->input('target_country');
        }
        
        if ($request->has('has_phone') && $request->input('has_phone') !== '') {
            // Accepter 'yes', 'no', true, false, 1, 0
            $hasPhone = $request->input('has_phone');
            $filters['has_phone'] = in_array(strtolower($hasPhone), ['yes', 'true', '1'], true);
        }

        $users = $this->userRepository->getAllClients($filters);

        return response()->json($users);
    }

    public function search(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'q' => ['required', 'string', 'min:1'],
        ]);

        $query = $request->input('q');
        
        $clients = User::where('role', 'client')
            ->where(function($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('email', 'LIKE', "%{$query}%");
            })
            ->limit(10)
            ->get();

        return response()->json($clients);
    }

    public function show(Request $request, User $user): JsonResponse
    {
        if (!$request->user()->isAdmin() && $request->user()->id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return response()->json($user->load(['inscriptions.country', 'documents']));
    }

    public function update(Request $request, User $user): JsonResponse
    {
        if (!$request->user()->isAdmin() && $request->user()->id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'name' => ['sometimes', 'string'],
            'phone' => ['sometimes', 'nullable', 'string'],
            'target_country' => ['sometimes', 'nullable', 'string'],
            'photo' => ['sometimes', 'nullable', 'image', 'max:2048'],
        ]);

        $data = $request->all();

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('profiles', 'public');
        }

        $this->userRepository->update($user, $data);

        return response()->json($user->fresh());
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $this->userRepository->delete($user);

        return response()->json(['message' => 'Utilisateur supprimé']);
    }

    /**
     * Récupère les statistiques publiques (nombre de clients)
     */
    public function stats(): JsonResponse
    {
        $clientsCount = User::where('role', 'client')->count();
        
        return response()->json([
            'clients_count' => $clientsCount,
        ]);
    }
}



