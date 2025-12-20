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
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'https://tfksservice.innosft.com'));
        
        $subject = match($this->status) {
            'validated' => 'Votre rendez-vous a été validé - TFKService',
            'rejected' => 'Votre rendez-vous a été rejeté - TFKService',
            'rescheduled' => 'Votre rendez-vous a été reporté - TFKService',
            default => 'Mise à jour de votre rendez-vous - TFKService',
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

