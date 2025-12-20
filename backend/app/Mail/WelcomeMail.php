<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user)
    {
    }

    public function build()
    {
        // Récupérer l'URL frontend depuis la config ou l'environnement
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'https://tfksservice.innosft.com'));
        
        return $this->subject('Bienvenue sur TFKService - Votre compte a été créé avec succès')
            ->view('emails.welcome')
            ->with([
                'user' => $this->user,
                'platformUrl' => $frontendUrl,
            ]);
    }
}














