<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Nouveau client inscrit</title>
</head>
<body>
    <h1>Nouveau client inscrit</h1>
    <p>Un nouveau client s'est inscrit sur la plateforme :</p>
    <ul>
        <li><strong>Nom :</strong> {{ $user->name }}</li>
        <li><strong>Email :</strong> {{ $user->email }}</li>
        <li><strong>Téléphone :</strong> {{ $user->phone ?? 'Non renseigné' }}</li>
        <li><strong>Pays visé :</strong> {{ $user->target_country ?? 'Non renseigné' }}</li>
    </ul>
    <p>Date d'inscription : {{ $user->created_at->format('d/m/Y H:i') }}</p>
</body>
</html>


















