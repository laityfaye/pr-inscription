<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de mot de passe - SBC Groupe</title>
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
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
        }
        .token-info {
            background-color: #e7f3ff;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Réinitialisation de votre mot de passe</h1>
        <p>Bonjour Mr/Mme {{ $user->name }},</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe sur la plateforme SBC Groupe.</p>
        
        <div style="text-align: center;">
            <a href="{{ $resetUrl }}" class="button">Réinitialiser mon mot de passe</a>
        </div>
        
        <div class="token-info">
            <p><strong>Note :</strong> Si le bouton ne fonctionne pas, copiez et collez le lien suivant dans votre navigateur :</p>
            <p style="word-break: break-all; color: #3498db;">{{ $resetUrl }}</p>
        </div>
        
        <div class="warning">
            <p><strong>⚠️ Important :</strong></p>
            <ul>
                <li>Ce lien est valide pendant 60 minutes uniquement</li>
                <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet e-mail</li>
                <li>Votre mot de passe ne sera pas modifié tant que vous n'aurez pas créé un nouveau mot de passe</li>
            </ul>
        </div>
        
        <p>Si vous rencontrez des problèmes, n'hésitez pas à nous contacter.</p>
        
        <div class="footer">
            <p>Cordialement,<br>L'équipe SBC Groupe</p>
        </div>
    </div>
</body>
</html>

