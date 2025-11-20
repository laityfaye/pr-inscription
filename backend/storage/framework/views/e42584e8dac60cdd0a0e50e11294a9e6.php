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
        <li><strong>Nom :</strong> <?php echo e($user->name); ?></li>
        <li><strong>Email :</strong> <?php echo e($user->email); ?></li>
        <li><strong>Téléphone :</strong> <?php echo e($user->phone ?? 'Non renseigné'); ?></li>
        <li><strong>Pays visé :</strong> <?php echo e($user->target_country ?? 'Non renseigné'); ?></li>
    </ul>
    <p>Date d'inscription : <?php echo e($user->created_at->format('d/m/Y H:i')); ?></p>
</body>
</html>













<?php /**PATH C:\Users\laity\Desktop\S\backend\resources\views\emails\new-client-notification.blade.php ENDPATH**/ ?>