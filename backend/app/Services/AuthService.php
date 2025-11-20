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

        // Envoyer les emails de manière asynchrone pour ne pas bloquer l'inscription
        // Si l'envoi échoue, l'inscription doit quand même réussir
        try {
            // Envoyer email de bienvenue au client
            Mail::to($user->email)->send(new WelcomeMail($user));
        } catch (\Exception $e) {
            // Logger l'erreur mais ne pas faire échouer l'inscription
            Log::warning('Erreur lors de l\'envoi de l\'email de bienvenue: ' . $e->getMessage());
        }

        try {
            // Envoyer notification à l'admin
            $adminEmail = config('mail.admin_email', 'laityfaye1709@gmail.com');
            Mail::to($adminEmail)->send(new NewClientNotificationMail($user));
        } catch (\Exception $e) {
            // Logger l'erreur mais ne pas faire échouer l'inscription
            Log::warning('Erreur lors de l\'envoi de la notification admin: ' . $e->getMessage());
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



