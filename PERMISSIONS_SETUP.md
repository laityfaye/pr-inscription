# Configuration des Permissions - Serveur de Production

## Informations du Serveur

- **Utilisateur** : tfksservice
- **Chemin des projets** : `~/pr-inscription/` ou `/home/tfksservice/pr-inscription/`
- **Backend** : `~/pr-inscription/backend`
- **Frontend** : `~/pr-inscription/frontend`

---

## Configuration des Permissions

### 1. Permissions du Backend

```bash
# Se placer dans le répertoire backend
cd ~/pr-inscription/backend

# Définir le propriétaire et le groupe
sudo chown -R tfksservice:www-data ~/pr-inscription/backend

# Permissions générales
sudo chmod -R 755 ~/pr-inscription/backend

# Permissions pour le stockage (écriture nécessaire)
sudo chmod -R 775 ~/pr-inscription/backend/storage
sudo chmod -R 775 ~/pr-inscription/backend/bootstrap/cache

# Permissions spécifiques pour les fichiers sensibles
sudo chmod 600 ~/pr-inscription/backend/.env
```

### 2. Permissions du Frontend

```bash
# Se placer dans le répertoire frontend
cd ~/pr-inscription/frontend

# Définir le propriétaire et le groupe
sudo chown -R tfksservice:www-data ~/pr-inscription/frontend

# Permissions générales
sudo chmod -R 755 ~/pr-inscription/frontend
```

### 3. Vérification des Permissions

```bash
# Vérifier les permissions du backend
ls -la ~/pr-inscription/backend
ls -la ~/pr-inscription/backend/storage
ls -la ~/pr-inscription/backend/bootstrap/cache

# Vérifier les permissions du frontend
ls -la ~/pr-inscription/frontend
ls -la ~/pr-inscription/frontend/dist
```

### 4. Permissions pour Nginx

Assurez-vous que Nginx peut lire les fichiers :

```bash
# Vérifier que www-data peut lire les fichiers
sudo -u www-data ls ~/pr-inscription/backend/public
sudo -u www-data ls ~/pr-inscription/frontend/dist
```

---

## Script de Configuration Automatique

Créez un script pour configurer toutes les permissions :

```bash
nano ~/setup-permissions.sh
```

Ajoutez le contenu suivant :

```bash
#!/bin/bash

echo "Configuration des permissions pour TFKS Platform..."

# Backend
echo "Configuration du backend..."
sudo chown -R tfksservice:www-data ~/pr-inscription/backend
sudo chmod -R 755 ~/pr-inscription/backend
sudo chmod -R 775 ~/pr-inscription/backend/storage
sudo chmod -R 775 ~/pr-inscription/backend/bootstrap/cache
sudo chmod 600 ~/pr-inscription/backend/.env

# Frontend
echo "Configuration du frontend..."
sudo chown -R tfksservice:www-data ~/pr-inscription/frontend
sudo chmod -R 755 ~/pr-inscription/frontend

echo "Permissions configurées avec succès!"
```

Rendez-le exécutable :

```bash
chmod +x ~/setup-permissions.sh
```

Exécutez-le :

```bash
~/setup-permissions.sh
```

---

## Problèmes Courants

### Erreur 403 Forbidden

Si vous obtenez une erreur 403, vérifiez :

1. **Permissions des répertoires** :
   ```bash
   ls -ld ~/pr-inscription/backend/public
   ls -ld ~/pr-inscription/frontend/dist
   ```
   Doivent être `drwxr-xr-x` ou `drwxrwxr-x`

2. **Propriétaire** :
   ```bash
   ls -ld ~/pr-inscription/backend/public
   ```
   Doit être `tfksservice` ou `www-data`

3. **Permissions SELinux** (si activé) :
   ```bash
   sudo setsebool -P httpd_read_user_content 1
   ```

### Erreur 500 Internal Server Error

Si vous obtenez une erreur 500, vérifiez :

1. **Permissions du fichier .env** :
   ```bash
   ls -la ~/pr-inscription/backend/.env
   ```
   Doit être `-rw-------` (600)

2. **Permissions du répertoire storage** :
   ```bash
   ls -ld ~/pr-inscription/backend/storage
   ```
   Doit être `drwxrwxr-x` (775)

3. **Logs Laravel** :
   ```bash
   tail -f ~/pr-inscription/backend/storage/logs/laravel.log
   ```

---

## Commandes Utiles

### Voir les permissions détaillées

```bash
# Backend
find ~/pr-inscription/backend -type d -exec ls -ld {} \;
find ~/pr-inscription/backend -type f -exec ls -l {} \;

# Frontend
find ~/pr-inscription/frontend -type d -exec ls -ld {} \;
```

### Réinitialiser toutes les permissions

```bash
# Backend
sudo chown -R tfksservice:www-data ~/pr-inscription/backend
sudo find ~/pr-inscription/backend -type d -exec chmod 755 {} \;
sudo find ~/pr-inscription/backend -type f -exec chmod 644 {} \;
sudo chmod -R 775 ~/pr-inscription/backend/storage
sudo chmod -R 775 ~/pr-inscription/backend/bootstrap/cache
sudo chmod 600 ~/pr-inscription/backend/.env

# Frontend
sudo chown -R tfksservice:www-data ~/pr-inscription/frontend
sudo find ~/pr-inscription/frontend -type d -exec chmod 755 {} \;
sudo find ~/pr-inscription/frontend -type f -exec chmod 644 {} \;
```

---

## Notes Importantes

1. **Sécurité** : Le fichier `.env` doit toujours avoir les permissions `600` (lecture/écriture uniquement pour le propriétaire)

2. **Stockage** : Les répertoires `storage` et `bootstrap/cache` doivent avoir les permissions `775` pour permettre à PHP-FPM d'écrire

3. **Propriétaire** : L'utilisateur `tfksservice` doit être le propriétaire des fichiers pour pouvoir les modifier

4. **Groupe** : Le groupe `www-data` doit avoir accès en lecture pour que Nginx puisse servir les fichiers

