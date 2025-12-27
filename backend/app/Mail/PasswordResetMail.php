<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $token
    ) {
    }

    public function build()
    {
        // Récupérer l'URL frontend depuis la config ou l'environnement
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'https://sbcgroupe.ca'));
        
        // Construire l'URL de réinitialisation
        $resetUrl = $frontendUrl . '/reset-password?token=' . $this->token . '&email=' . urlencode($this->user->email);
        
        return $this->subject('Réinitialisation de votre mot de passe - SBC Groupe')
            ->view('emails.password-reset')
            ->with([
                'user' => $this->user,
                'token' => $this->token,
                'resetUrl' => $resetUrl,
                'platformUrl' => $frontendUrl,
            ]);
    }
}

