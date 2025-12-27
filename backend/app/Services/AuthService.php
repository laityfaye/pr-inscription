<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Mail\WelcomeMail;
use App\Mail\NewClientNotificationMail;
use App\Mail\PasswordResetMail;

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

    public function forgotPassword(string $email): bool
    {
        $user = $this->userRepository->findByEmail($email);

        if (!$user) {
            // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
            return true;
        }

        // Générer un token de réinitialisation
        $token = Str::random(64);

        // Supprimer les anciens tokens pour cet email
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Insérer le nouveau token
        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        // Envoyer l'e-mail de réinitialisation
        try {
            Mail::to($user->email)->queue(new PasswordResetMail($user, $token));
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'envoi de l\'e-mail de réinitialisation: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
            throw $e;
        }

        return true;
    }

    public function resetPassword(string $email, string $token, string $password): bool
    {
        // Récupérer le token de réinitialisation
        $passwordReset = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$passwordReset) {
            return false;
        }

        // Vérifier si le token est valide (expire après 60 minutes)
        if (now()->diffInMinutes($passwordReset->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            return false;
        }

        // Vérifier le token
        if (!Hash::check($token, $passwordReset->token)) {
            return false;
        }

        // Mettre à jour le mot de passe
        $user = $this->userRepository->findByEmail($email);
        if (!$user) {
            return false;
        }

        $this->userRepository->update($user, [
            'password' => Hash::make($password),
        ]);

        // Supprimer le token utilisé
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        return true;
    }
}



