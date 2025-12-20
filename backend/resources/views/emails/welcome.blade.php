<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue sur SBC Groupe</title>
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
        ul {
            padding-left: 20px;
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
        <h1>Bienvenue Mr/Mme {{ $user->name }} !</h1>
        <p>Nous vous remercions pour votre inscription sur la plateforme de demande de visa et d'orientation lié à vos projets de voyage de SBC Groupe .
        </p>
        <p>Votre compte a été créé avec succès. Vous pouvez dès à présent :</p>
        <ul>
            <li>Accéder à votre espace personnel</li>
            <li>Télécharger les documents requis</li>
            <li>Suivre l'état de votre préinscription</li>
            <li>Échanger avec notre équipe via le service de messagerie intégré</li>
        </ul>
        <p>Nous vous invitons à compléter votre dossier dans les meilleurs délais afin de faciliter le traitement de votre préinscription.</p>
        <p>Notre équipe reste à votre entière disposition pour toute information complémentaire.</p>
        <div style="text-align: center;">
            <a href="{{ $platformUrl }}" class="button">Accéder à la plateforme</a>
        </div>
        <div class="footer">
            <p>Cordialement,<br>L'équipe SBC Groupe</p>
        </div>
    </div>
</body>
</html>














