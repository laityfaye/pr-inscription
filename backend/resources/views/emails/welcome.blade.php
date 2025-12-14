<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue sur TFKS</title>
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
        <h1>Bienvenue {{ $user->name }} !</h1>
        <p>Merci de vous être inscrit sur la plateforme de préinscriptions TFKS Touba Fall Khidma Services.</p>
        <p>Votre compte a été créé avec succès. Vous pouvez maintenant :</p>
        <ul>
            <li>Accéder à votre espace personnel</li>
            <li>Uploader vos documents</li>
            <li>Suivre l'état de votre préinscription</li>
            <li>Communiquer avec notre équipe via le chat</li>
        </ul>
        <div style="text-align: center;">
            <a href="{{ $platformUrl }}" class="button">Accéder à la plateforme</a>
        </div>
        <div class="footer">
            <p>Cordialement,<br>L'équipe TFKS Touba Fall Khidma Services</p>
        </div>
    </div>
</body>
</html>














