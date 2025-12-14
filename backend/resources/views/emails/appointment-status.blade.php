<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mise à jour de votre rendez-vous</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 10px;
        }
        h1 {
            color: #2c3e50;
        }
        .status-validated {
            color: #27ae60;
            font-weight: bold;
        }
        .status-rejected {
            color: #e74c3c;
            font-weight: bold;
        }
        .status-rescheduled {
            color: #f39c12;
            font-weight: bold;
        }
        .appointment-details {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #3498db;
        }
        .appointment-details p {
            margin: 10px 0;
        }
        .appointment-details strong {
            color: #2c3e50;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #3498db;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #2980b9;
        }
        .reason-box {
            background-color: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #ffc107;
            margin: 15px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Mise à jour de votre rendez-vous</h1>
        
        @if($status === 'validated')
            <p class="status-validated">✓ Votre rendez-vous a été validé avec succès !</p>
            <p>Nous avons le plaisir de vous informer que votre demande de rendez-vous a été validée.</p>
        @elseif($status === 'rejected')
            <p class="status-rejected">✗ Votre rendez-vous a été rejeté</p>
            <p>Nous sommes au regret de vous informer que votre demande de rendez-vous a été rejetée.</p>
            @if($appointment->rejection_reason)
                <div class="reason-box">
                    <strong>Raison :</strong>
                    <p>{{ $appointment->rejection_reason }}</p>
                </div>
            @endif
        @elseif($status === 'rescheduled')
            <p class="status-rescheduled">↻ Votre rendez-vous a été reporté</p>
            <p>Nous vous informons que votre rendez-vous a été reporté à une nouvelle date et heure.</p>
        @endif

        <div class="appointment-details">
            <h2 style="margin-top: 0; color: #2c3e50;">Détails du rendez-vous</h2>
            <p><strong>Nom :</strong> {{ $appointment->name }}</p>
            <p><strong>Email :</strong> {{ $appointment->email }}</p>
            <p><strong>Téléphone :</strong> {{ $appointment->phone }}</p>
            <p><strong>Date :</strong> {{ \Carbon\Carbon::parse($appointment->date)->format('d/m/Y') }}</p>
            <p><strong>Heure :</strong> {{ $appointment->time }}</p>
            @if($appointment->message)
                <p><strong>Message :</strong> {{ $appointment->message }}</p>
            @endif
        </div>

        <div style="text-align: center;">
            <a href="{{ $platformUrl }}" class="button">Accéder à la plateforme</a>
        </div>

        <div class="footer">
            <p>Pour toute question, n'hésitez pas à nous contacter.</p>
            <p>Cordialement,<br>L'équipe TFKS Touba Fall Khidma Services</p>
        </div>
    </div>
</body>
</html>

