<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\UnavailableDay;
use App\Models\SlotPrice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Appointment::query();

        // Filtres
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date')) {
            $query->where('date', $request->date);
        }

        $appointments = $query->orderBy('date', 'desc')
                              ->orderBy('time', 'desc')
                              ->get();

        return response()->json($appointments);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date', 'after_or_equal:today'],
            'time' => ['required', 'string', 'in:08:00,09:00,10:00,11:00,12:00,15:00,16:00,17:00,18:00'],
            'message' => ['nullable', 'string'],
            'payment_proof' => ['required', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:5120'], // 5MB max
        ]);

        // Vérifier si le jour est indisponible
        $isUnavailable = UnavailableDay::where('date', $request->date)->exists();
        if ($isUnavailable) {
            return response()->json([
                'message' => 'Ce jour n\'est pas disponible pour les rendez-vous'
            ], 422);
        }

        // Vérifier si le créneau est déjà réservé
        $existingAppointment = Appointment::where('date', $request->date)
                                         ->where('time', $request->time)
                                         ->whereIn('status', ['pending', 'validated'])
                                         ->exists();

        if ($existingAppointment) {
            return response()->json([
                'message' => 'Ce créneau est déjà réservé'
            ], 422);
        }

        // Récupérer le prix du créneau
        $slotPrice = SlotPrice::where('time', $request->time)->first();
        $amount = $slotPrice ? $slotPrice->price : null;

        // Stocker le fichier de preuve de paiement
        $paymentProofPath = null;
        if ($request->hasFile('payment_proof')) {
            $file = $request->file('payment_proof');
            $paymentProofPath = $file->store('appointments/payment-proofs', 'public');
        }

        $appointment = Appointment::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'date' => $request->date,
            'time' => $request->time,
            'message' => $request->message,
            'payment_proof' => $paymentProofPath,
            'status' => 'pending',
            'amount' => $amount,
        ]);

        return response()->json($appointment, 201);
    }

    public function show(Request $request, Appointment $appointment): JsonResponse
    {
        // Les admins et avocats peuvent voir tous les rendez-vous
        $user = $request->user();
        if (!$user || (!$user->isAdmin() && !$user->isAvocat())) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $appointment->load('validator');

        return response()->json($appointment);
    }

    public function validateAppointment(Request $request, Appointment $appointment): JsonResponse
    {
        $user = $request->user();
        if (!$user || (!$user->isAdmin() && !$user->isAvocat())) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($appointment->status !== 'pending') {
            return response()->json([
                'message' => 'Ce rendez-vous ne peut pas être validé'
            ], 422);
        }

        $appointment->update([
            'status' => 'validated',
            'validated_by' => $request->user()->id,
            'validated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Rendez-vous validé avec succès',
            'appointment' => $appointment->fresh('validator'),
        ]);
    }

    public function reject(Request $request, Appointment $appointment): JsonResponse
    {
        $user = $request->user();
        if (!$user || (!$user->isAdmin() && !$user->isAvocat())) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'reason' => ['nullable', 'string'],
        ]);

        if ($appointment->status !== 'pending') {
            return response()->json([
                'message' => 'Ce rendez-vous ne peut pas être rejeté'
            ], 422);
        }

        $appointment->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason,
        ]);

        return response()->json([
            'message' => 'Rendez-vous rejeté',
            'appointment' => $appointment->fresh(),
        ]);
    }

    public function getBookedSlots(): JsonResponse
    {
        // Récupérer tous les créneaux réservés (pending ou validated)
        $bookedSlots = Appointment::whereIn('status', ['pending', 'validated'])
                                  ->select('date', 'time')
                                  ->get()
                                  ->map(function ($appointment) {
                                      // Formater le time en string 'HH:MM' (sans les secondes)
                                      $timeValue = $appointment->time;
                                      
                                      if (is_string($timeValue)) {
                                          // Si c'est déjà une string, extraire seulement HH:MM
                                          $timeFormatted = substr($timeValue, 0, 5);
                                      } elseif (is_object($timeValue) && method_exists($timeValue, 'format')) {
                                          // Si c'est un objet DateTime/Time, formater en HH:MM
                                          $timeFormatted = $timeValue->format('H:i');
                                      } else {
                                          // Sinon, convertir en string et extraire HH:MM
                                          $timeStr = (string) $timeValue;
                                          $timeFormatted = substr($timeStr, 0, 5);
                                      }
                                      
                                      return [
                                          'date' => is_string($appointment->date) ? $appointment->date : $appointment->date->format('Y-m-d'),
                                          'time' => $timeFormatted,
                                      ];
                                  })
                                  ->values()
                                  ->toArray();

        return response()->json($bookedSlots);
    }

    public function getUnavailableDays(): JsonResponse
    {
        $days = UnavailableDay::select('date')
                              ->get()
                              ->pluck('date')
                              ->map(function ($date) {
                                  return is_string($date) ? $date : $date->format('Y-m-d');
                              })
                              ->values()
                              ->toArray();

        return response()->json($days);
    }

    public function addUnavailableDay(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || (!$user->isAdmin() && !$user->isAvocat())) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today'],
        ]);

        $unavailableDay = UnavailableDay::firstOrCreate([
            'date' => $request->date,
        ], [
            'reason' => $request->reason,
        ]);

        return response()->json($unavailableDay, 201);
    }

    public function removeUnavailableDay(Request $request, $date): JsonResponse
    {
        $user = $request->user();
        if (!$user || (!$user->isAdmin() && !$user->isAvocat())) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $unavailableDay = UnavailableDay::where('date', $date)->first();

        if (!$unavailableDay) {
            return response()->json(['message' => 'Jour non trouvé'], 404);
        }

        $unavailableDay->delete();

        return response()->json(['message' => 'Jour retiré des jours indisponibles']);
    }

    public function getSlotPrices(): JsonResponse
    {
        $slotPrices = SlotPrice::all();
        $prices = [];
        
        foreach ($slotPrices as $slotPrice) {
            // Formater le time en string 'HH:MM' (sans les secondes)
            $timeValue = $slotPrice->time;
            
            if (is_string($timeValue)) {
                // Si c'est déjà une string, extraire seulement HH:MM
                $timeKey = substr($timeValue, 0, 5); // Prendre seulement les 5 premiers caractères (HH:MM)
            } elseif (is_object($timeValue) && method_exists($timeValue, 'format')) {
                // Si c'est un objet DateTime/Time, formater en HH:MM
                $timeKey = $timeValue->format('H:i');
            } else {
                // Sinon, convertir en string et extraire HH:MM
                $timeStr = (string) $timeValue;
                $timeKey = substr($timeStr, 0, 5);
            }
            
            $prices[$timeKey] = [
                'price' => (float) $slotPrice->price,
                'currency' => $slotPrice->currency ?? 'FCFA',
            ];
        }

        return response()->json($prices);
    }

    public function updateSlotPrice(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || (!$user->isAdmin() && !$user->isAvocat())) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'time' => ['required', 'string', 'in:08:00,09:00,10:00,11:00,12:00,15:00,16:00,17:00,18:00'],
            'price' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:10'],
        ]);

        $slotPrice = SlotPrice::updateOrCreate(
            ['time' => $request->time],
            [
                'price' => $request->price,
                'currency' => $request->currency ?? 'FCFA',
            ]
        );

        // Retourner tous les prix mis à jour pour synchronisation
        $slotPrices = SlotPrice::all();
        $allPrices = [];
        
        foreach ($slotPrices as $sp) {
            // Formater le time en string 'HH:MM' (sans les secondes)
            $timeValue = $sp->time;
            
            if (is_string($timeValue)) {
                // Si c'est déjà une string, extraire seulement HH:MM
                $timeKey = substr($timeValue, 0, 5); // Prendre seulement les 5 premiers caractères (HH:MM)
            } elseif (is_object($timeValue) && method_exists($timeValue, 'format')) {
                // Si c'est un objet DateTime/Time, formater en HH:MM
                $timeKey = $timeValue->format('H:i');
            } else {
                // Sinon, convertir en string et extraire HH:MM
                $timeStr = (string) $timeValue;
                $timeKey = substr($timeStr, 0, 5);
            }
            
            $allPrices[$timeKey] = [
                'price' => (float) $sp->price,
                'currency' => $sp->currency ?? 'FCFA',
            ];
        }

        return response()->json([
            'message' => 'Prix mis à jour',
            'slot_price' => $slotPrice,
            'all_prices' => $allPrices,
        ]);
    }
}

