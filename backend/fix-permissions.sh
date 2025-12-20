#!/bin/bash

# Script pour corriger les permissions Laravel
# À exécuter sur le serveur avec les droits appropriés

echo "🔧 Correction des permissions Laravel..."

# Chemin du projet
PROJECT_PATH="/home/deploy/pr-inscription/backend"

# Vérifier que le chemin existe
if [ ! -d "$PROJECT_PATH" ]; then
    echo "❌ Erreur: Le répertoire $PROJECT_PATH n'existe pas"
    exit 1
fi

cd "$PROJECT_PATH" || exit 1

# Définir le propriétaire (remplacez 'deploy' par l'utilisateur approprié)
OWNER="deploy"
GROUP="www-data"

echo "📁 Correction des permissions des répertoires storage et bootstrap/cache..."

# Répertoires storage et bootstrap/cache - permissions 775
sudo chmod -R 775 storage bootstrap/cache

# Définir le propriétaire et le groupe
sudo chown -R $OWNER:$GROUP storage bootstrap/cache

# Créer les répertoires s'ils n'existent pas
mkdir -p storage/logs
mkdir -p storage/framework/cache
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/app/public

# Permissions spécifiques pour les logs
echo "📝 Correction des permissions des logs..."
sudo chmod -R 775 storage/logs
sudo chown -R $OWNER:$GROUP storage/logs

# Créer le fichier laravel.log s'il n'existe pas et lui donner les bonnes permissions
if [ ! -f storage/logs/laravel.log ]; then
    touch storage/logs/laravel.log
    sudo chmod 664 storage/logs/laravel.log
    sudo chown $OWNER:$GROUP storage/logs/laravel.log
else
    sudo chmod 664 storage/logs/laravel.log
    sudo chown $OWNER:$GROUP storage/logs/laravel.log
fi

# Permissions pour le répertoire public de storage
echo "📦 Correction des permissions de storage/app/public..."
sudo chmod -R 775 storage/app/public
sudo chown -R $OWNER:$GROUP storage/app/public

# Créer le répertoire documents s'il n'existe pas
mkdir -p storage/app/public/documents
sudo chmod -R 775 storage/app/public/documents
sudo chown -R $OWNER:$GROUP storage/app/public/documents

# Vérifier que le lien symbolique storage existe
if [ ! -L public/storage ]; then
    echo "🔗 Création du lien symbolique storage..."
    php artisan storage:link
fi

echo "✅ Permissions corrigées avec succès!"
echo ""
echo "📋 Résumé des permissions:"
echo "   - storage/: 775"
echo "   - bootstrap/cache/: 775"
echo "   - storage/logs/laravel.log: 664"
echo "   - storage/app/public/: 775"
echo ""
echo "⚠️  Si vous utilisez PHP-FPM, assurez-vous que l'utilisateur PHP-FPM (généralement www-data) peut écrire dans ces répertoires."
echo "   Vous pouvez ajouter l'utilisateur PHP-FPM au groupe $GROUP ou ajuster les permissions selon votre configuration."

