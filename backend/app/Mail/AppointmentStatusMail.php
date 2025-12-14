<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AppointmentStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Appointment $appointment,
        public string $status // 'validated', 'rejected', 'rescheduled'
    ) {
    }

    public function build()
    {
        // Récupérer l'URL frontend depuis la config ou l'environnement
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'https://sbcgroupe.ca'));
        
        $subject = match($this->status) {
            'validated' => 'Votre rendez-vous a été validé - SBC Groupe',
            'rejected' => 'Votre rendez-vous a été rejeté - SBC Groupe',
            'rescheduled' => 'Votre rendez-vous a été reporté - SBC Groupe',
            default => 'Mise à jour de votre rendez-vous - SBC Groupe',
        };

        return $this->subject($subject)
            ->view('emails.appointment-status')
            ->with([
                'appointment' => $this->appointment,
                'status' => $this->status,
                'platformUrl' => $frontendUrl,
            ]);
    }
}

