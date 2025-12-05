# Correction des headers CORS dupliqués

## Problème identifié

Les headers CORS étaient ajoutés **deux fois** :
1. Par nginx (dans `location /` et `location ~ \.php$`)
2. Par Laravel (via le middleware CORS)

Cela causait l'erreur : `The 'Access-Control-Allow-Origin' header contains multiple values`

## Solution appliquée

✅ **Nginx** : Supprimé les headers CORS (sauf pour les requêtes OPTIONS)
✅ **Laravel** : Configuré pour gérer tous les headers CORS
✅ **CORS config** : Mis à jour pour autoriser uniquement le domaine frontend

## Étapes à suivre sur le serveur

### 1. Mettre à jour la configuration nginx

```bash
sudo nano /etc/nginx/sites-available/backend.sbcgroupe.ca
```

**Remplacez la section `location /` et `location ~ \.php$` par :**

```nginx
    # ------------------------------
    # API Laravel – Toutes les routes
    # ------------------------------
    location / {
        # Gérer les requêtes OPTIONS (preflight CORS) - laisser Laravel gérer les autres headers CORS
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin $http_origin always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-Requested-With" always;
            add_header Access-Control-Allow-Credentials "true" always;
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }

        try_files $uri $uri/ /index.php?$query_string;
    }

    # ------------------------------
    # PHP FPM – Laravel index.php
    # ------------------------------
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;

        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root;

        fastcgi_read_timeout 300;
        fastcgi_send_timeout 300;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 4 256k;
        fastcgi_busy_buffers_size 256k;
    }
```

**Important** : Supprimez tous les `add_header Access-Control-*` de la section `location ~ \.php$`

### 2. Mettre à jour la configuration CORS de Laravel

```bash
cd /home/deploy/pr-inscription/backend
nano config/cors.php
```

**Modifiez la ligne `allowed_origins` :**

```php
'allowed_origins' => [
    'https://preinscription.sbcgroupe.ca',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
],
```

### 3. Vider le cache Laravel

```bash
cd /home/deploy/pr-inscription/backend
php artisan config:clear
php artisan cache:clear
```

### 4. Tester et recharger nginx

```bash
# Tester la configuration
sudo nginx -t

# Recharger nginx
sudo systemctl reload nginx
```

### 5. Vérifier

Testez depuis le frontend. Les erreurs CORS devraient être résolues.

## Résumé des changements

**Avant** :
- ❌ Headers CORS dans nginx ET Laravel → Duplication
- ❌ `allowed_origins => ['*']` → Trop permissif

**Après** :
- ✅ Headers CORS uniquement dans Laravel
- ✅ Nginx gère uniquement les requêtes OPTIONS
- ✅ `allowed_origins` limité au domaine frontend

## Vérification

Ouvrez la console du navigateur et vérifiez que :
- ✅ Plus d'erreur "multiple values" pour CORS
- ✅ Les requêtes API fonctionnent
- ✅ Les headers CORS sont présents une seule fois

