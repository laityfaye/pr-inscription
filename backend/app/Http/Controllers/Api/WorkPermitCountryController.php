<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkPermitCountry;
use App\Repositories\WorkPermitCountryRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkPermitCountryController extends Controller
{
    public function __construct(
        private WorkPermitCountryRepository $repository
    ) {}

    public function index(Request $request): JsonResponse
    {
        $path = $request->path();
        $isAllRoute = strpos($path, 'work-permit-countries/all') !== false || $request->has('all');
        
        if ($request->user()?->isAdmin() && $isAllRoute) {
            $countries = $this->repository->getAll();
        } else {
            $countries = $this->repository->getActive();
        }

        return response()->json($countries);
    }

    public function show(WorkPermitCountry $workPermitCountry): JsonResponse
    {
        return response()->json($workPermitCountry);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:3'],
            'flag' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'eligibility_conditions' => ['nullable', 'string'],
            'required_documents' => ['nullable', 'string'],
            'application_process' => ['nullable', 'string'],
            'processing_time' => ['nullable', 'string'],
            'costs' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $country = $this->repository->create($request->all());

        return response()->json($country, 201);
    }

    public function update(Request $request, WorkPermitCountry $workPermitCountry): JsonResponse
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:3'],
            'flag' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'eligibility_conditions' => ['nullable', 'string'],
            'required_documents' => ['nullable', 'string'],
            'application_process' => ['nullable', 'string'],
            'processing_time' => ['nullable', 'string'],
            'costs' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $this->repository->update($workPermitCountry, $request->all());

        return response()->json($workPermitCountry->fresh());
    }

    public function destroy(Request $request, WorkPermitCountry $workPermitCountry): JsonResponse
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($workPermitCountry->applications()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer ce pays car il est associé à des demandes',
            ], 422);
        }

        $this->repository->delete($workPermitCountry);

        return response()->json(['message' => 'Pays supprimé avec succès']);
    }
}

