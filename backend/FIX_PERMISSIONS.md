# 🔧 Correction des Permissions Laravel

## Problème

Si vous rencontrez ces erreurs :
- `The stream or file "/home/deploy/pr-inscription/backend/storage/logs/laravel.log" could not be opened in append mode: Permission denied`
- `Storage directory not writable`

Cela signifie que les permissions des répertoires Laravel ne sont pas correctement configurées.

## Solution Rapide

### Option 1 : Utiliser le script automatique

```bash
cd /home/deploy/pr-inscription/backend
chmod +x fix-permissions.sh
sudo ./fix-permissions.sh
```

### Option 2 : Commandes manuelles

```bash
cd /home/deploy/pr-inscription/backend

# Donner les permissions aux répertoires storage et bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# Définir le propriétaire (remplacez 'deploy' et 'www-data' selon votre configuration)
sudo chown -R deploy:www-data storage bootstrap/cache

# Permissions spécifiques pour les logs
sudo chmod -R 775 storage/logs
sudo chown -R deploy:www-data storage/logs

# Créer et configurer le fichier laravel.log
sudo touch storage/logs/laravel.log
sudo chmod 664 storage/logs/laravel.log
sudo chown deploy:www-data storage/logs/laravel.log

# Permissions pour le répertoire public de storage
sudo chmod -R 775 storage/app/public
sudo chown -R deploy:www-data storage/app/public

# Créer le répertoire documents s'il n'existe pas
sudo mkdir -p storage/app/public/documents
sudo chmod -R 775 storage/app/public/documents
sudo chown -R deploy:www-data storage/app/public/documents

# Créer le lien symbolique storage si nécessaire
php artisan storage:link
```

## Vérification

Après avoir exécuté les commandes, vérifiez que tout fonctionne :

```bash
# Vérifier les permissions
ls -la storage/logs/
ls -la storage/app/public/

# Tester l'écriture (remplacez 'www-data' par votre utilisateur PHP-FPM)
sudo -u www-data touch storage/logs/test.log
sudo -u www-data rm storage/logs/test.log
```

## Configuration PHP-FPM

Si vous utilisez PHP-FPM, assurez-vous que l'utilisateur PHP-FPM peut écrire dans ces répertoires.

### Vérifier l'utilisateur PHP-FPM

```bash
# Voir la configuration PHP-FPM
grep -E "^user|^group" /etc/php/*/fpm/pool.d/www.conf
```

### Solutions possibles

1. **Ajouter l'utilisateur PHP-FPM au groupe du propriétaire** :
   ```bash
   sudo usermod -a -G deploy www-data  # ou l'utilisateur approprié
   ```

2. **Ou ajuster les permissions pour permettre l'écriture au groupe** :
   ```bash
   sudo chmod -R 775 storage bootstrap/cache
   sudo chgrp -R www-data storage bootstrap/cache
   ```

## Notes importantes

- Les permissions `775` permettent la lecture, écriture et exécution pour le propriétaire et le groupe
- Les permissions `664` pour les fichiers de log permettent la lecture/écriture pour le propriétaire et le groupe
- Assurez-vous que le serveur web (nginx/apache) et PHP-FPM peuvent accéder à ces répertoires
- Après chaque déploiement, vérifiez que les permissions sont toujours correctes

## Après correction

Une fois les permissions corrigées, testez l'upload d'un document depuis l'interface web. L'erreur 500 devrait être résolue.

