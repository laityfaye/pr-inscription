<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\WelcomeMail;
use App\Mail\NewClientNotificationMail;

class AuthService
{
    public function __construct(
        private UserRepository $userRepository
    ) {}

    public function register(array $data): User
    {
        $data['password'] = Hash::make($data['password']);
        $data['role'] = 'client';

        $user = $this->userRepository->create($data);

        // Envoyer l'e-mail de bienvenue en queue
        try {
            Mail::to($user->email)->queue(new WelcomeMail($user));
        } catch (\Exception $e) {
            // Logger l'erreur mais ne pas faire échouer l'inscription
            Log::error('Erreur lors de l\'envoi de l\'e-mail de bienvenue: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        }

        return $user;
    }

    public function login(array $credentials): ?array
    {
        $user = $this->userRepository->findByEmail($credentials['email']);

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return null;
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}



