<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewClientNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user)
    {
    }

    public function build()
    {
        return $this->subject('Nouveau client inscrit sur la plateforme de préinscription')
            ->view('emails.new-client-notification')
            ->with(['user' => $this->user]);
    }
}














