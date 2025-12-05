# Migration du domaine : preinscription.sbcgroupe.ca → sbcgroupe.ca

## ✅ Modifications effectuées

### 1. Copies de sauvegarde créées
- `nginx.conf.backup`
- `nginx-frontend-only.conf.backup`
- `nginx-backend-subdomain.conf.backup`
- `nginx-simple.conf.backup`

### 2. Fichiers nginx modifiés
- ✅ `nginx.conf` : Domaine changé de `preinscription.sbcgroupe.ca` → `sbcgroupe.ca` (avec www)
- ✅ `nginx-frontend-only.conf` : Domaine changé de `preinscription.sbcgroupe.ca` → `sbcgroupe.ca` (avec www)
- ✅ `nginx-simple.conf` : Domaine changé de `preinscription.sbcgroupe.ca` → `sbcgroupe.ca` (avec www)
- ✅ `nginx-backend-subdomain.conf` : Aucun changement (utilise déjà `backend.sbcgroupe.ca`)

### 3. Configuration CORS backend modifiée
- ✅ `backend/config/cors.php` : Ajout de `https://sbcgroupe.ca` et `https://www.sbcgroupe.ca` dans les origines autorisées

## 📋 Étapes à suivre sur le serveur

### 1. Obtenir les certificats SSL pour sbcgroupe.ca

```bash
# Obtenir le certificat pour sbcgroupe.ca et www.sbcgroupe.ca
sudo certbot certonly --nginx -d sbcgroupe.ca -d www.sbcgroupe.ca
```

### 2. Créer des copies de sauvegarde sur le serveur

```bash
# Sauvegarder les configurations actuelles
sudo cp /etc/nginx/sites-available/preinscription.sbcgroupe.ca /etc/nginx/sites-available/preinscription.sbcgroupe.ca.backup
sudo cp /etc/nginx/sites-enabled/preinscription.sbcgroupe.ca /etc/nginx/sites-enabled/preinscription.sbcgroupe.ca.backup 2>/dev/null || true
```

### 3. Mettre à jour la configuration nginx sur le serveur

```bash
# Copier la nouvelle configuration
sudo nano /etc/nginx/sites-available/sbcgroupe.ca
# Copier le contenu de nginx.conf (ou nginx-frontend-only.conf selon votre architecture)

# Activer la nouvelle configuration
sudo ln -s /etc/nginx/sites-available/sbcgroupe.ca /etc/nginx/sites-enabled/

# Désactiver l'ancienne configuration (optionnel, gardez-la pour rollback)
sudo rm /etc/nginx/sites-enabled/preinscription.sbcgroupe.ca 2>/dev/null || true

# Tester la configuration
sudo nginx -t

# Recharger nginx
sudo systemctl reload nginx
```

### 4. Mettre à jour le fichier .env du backend

```bash
cd /home/deploy/pr-inscription/backend
nano .env
```

**Modifier ces variables :**

```env
# URL du frontend (pour Sanctum)
FRONTEND_URL=https://sbcgroupe.ca

# Domaines stateful pour Sanctum (ajoutez le nouveau domaine)
SANCTUM_STATEFUL_DOMAINS=sbcgroupe.ca,www.sbcgroupe.ca,backend.sbcgroupe.ca,localhost,localhost:3000,127.0.0.1,127.0.0.1:8000

# URL de l'application (backend) - reste inchangé
APP_URL=https://backend.sbcgroupe.ca
```

**Puis vider le cache :**

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### 5. Mettre à jour la configuration CORS

La configuration CORS a déjà été mise à jour dans le code. Sur le serveur :

```bash
cd /home/deploy/pr-inscription/backend
php artisan config:clear
```

### 6. Vérifier les DNS

Assurez-vous que les enregistrements DNS pointent correctement :

```bash
# Vérifier les DNS
dig sbcgroupe.ca
dig www.sbcgroupe.ca
```

Les enregistrements A doivent pointer vers l'IP de votre serveur.

### 7. Tester

1. **Frontend** : `https://sbcgroupe.ca/` → Devrait fonctionner
2. **Frontend avec www** : `https://www.sbcgroupe.ca/` → Devrait fonctionner
3. **Backend API** : `https://backend.sbcgroupe.ca/api/countries` → Devrait retourner des données
4. **Frontend → Backend** : Le frontend devrait pouvoir appeler l'API sans erreur CORS

## ⚠️ Notes importantes

1. **Certificats SSL** : Les certificats pour `preinscription.sbcgroupe.ca` peuvent être conservés pour une période de transition, mais vous devrez obtenir de nouveaux certificats pour `sbcgroupe.ca`.

2. **Redirection** : Vous pouvez optionnellement créer une redirection de `preinscription.sbcgroupe.ca` vers `sbcgroupe.ca` pour une période de transition.

3. **Logs** : Les logs ont été renommés de `preinscription-access.log` / `preinscription-error.log` vers `sbcgroupe-access.log` / `sbcgroupe-error.log`.

4. **Rollback** : Si quelque chose ne fonctionne pas, vous pouvez restaurer les configurations de sauvegarde :
   ```bash
   sudo cp /etc/nginx/sites-available/preinscription.sbcgroupe.ca.backup /etc/nginx/sites-available/preinscription.sbcgroupe.ca
   sudo ln -s /etc/nginx/sites-available/preinscription.sbcgroupe.ca /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## 🔄 Redirection optionnelle (ancien domaine vers nouveau)

Si vous voulez rediriger `preinscription.sbcgroupe.ca` vers `sbcgroupe.ca` :

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name preinscription.sbcgroupe.ca;
    return 301 https://sbcgroupe.ca$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name preinscription.sbcgroupe.ca;
    
    ssl_certificate     /etc/letsencrypt/live/preinscription.sbcgroupe.ca/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/preinscription.sbcgroupe.ca/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    return 301 https://sbcgroupe.ca$request_uri;
}
```

