# Correction HTTPS - Étapes à suivre

## Problème identifié
Le fichier `/etc/nginx/sites-available/preinscription` ne contient **PAS** le bloc HTTPS (port 443).

## Solution : Ajouter le bloc HTTPS

### Étape 1 : Voir la configuration actuelle
```bash
sudo cat /etc/nginx/sites-available/preinscription
```

### Étape 2 : Sauvegarder la configuration actuelle
```bash
sudo cp /etc/nginx/sites-available/preinscription /etc/nginx/sites-available/preinscription.backup
```

### Étape 3 : Éditer le fichier de configuration
```bash
sudo nano /etc/nginx/sites-available/preinscription
```

### Étape 4 : Remplacer le contenu par la configuration complète

**Copiez-collez cette configuration complète** (elle contient les blocs HTTP et HTTPS) :

```nginx
# =============================
#   PREINSCRIPTION.SBCGROUPE.CA
#   Nginx + React + Laravel API
# =============================

# ------------------------------
# HTTP → Redirection vers HTTPS
# ------------------------------
server {
    listen 80;
    listen [::]:80;
    server_name preinscription.sbcgroupe.ca;

    return 301 https://$server_name$request_uri;
}

# ------------------------------
# HTTPS – Site complet
# ------------------------------
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name preinscription.sbcgroupe.ca;

    # ------------------------------
    # SSL Certificates – Let's Encrypt
    # ------------------------------
    ssl_certificate     /etc/letsencrypt/live/preinscription.sbcgroupe.ca/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/preinscription.sbcgroupe.ca/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;

    # Diffie Hellman
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Logs
    access_log /var/log/nginx/preinscription-access.log;
    error_log  /var/log/nginx/preinscription-error.log;

    # Taille upload
    client_max_body_size 25M;

    # ------------------------------
    # FRONTEND REACT (Vite)
    # ------------------------------
    root /home/deploy/pr-inscription/frontend/dist;
    index index.html;

    # Cache assets
    location ~* \.(jpg|jpeg|png|gif|webp|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Route SPA – renvoie index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ------------------------------
    # STORAGE Laravel
    # ------------------------------
    location /storage {
        alias /home/deploy/pr-inscription/backend/storage/app/public;

        location ~ \.php$ {
            deny all;
        }

        expires 7d;
        add_header Cache-Control "public";
    }

    # ------------------------------
    # API Laravel – /api/*
    # ------------------------------
    location /api {
        alias /home/deploy/pr-inscription/backend/public;
        try_files $uri $uri/ @laravel;

        # CORS
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials "true" always;

        if ($request_method = OPTIONS) {
            return 204;
        }
    }

    # Laravel rewrite
    location @laravel {
        rewrite ^/api/(.*)$ /api/index.php?$query_string last;
    }

    # ------------------------------
    # PHP FPM – Laravel index.php
    # ------------------------------
    location ~ ^/api/index\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;

        fastcgi_param SCRIPT_FILENAME /home/deploy/pr-inscription/backend/public/index.php;

        fastcgi_read_timeout 300;
        fastcgi_send_timeout 300;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 4 256k;
        fastcgi_busy_buffers_size 256k;
    }

    # Bloquer l'exécution de PHP ailleurs
    location ~ \.php$ {
        deny all;
    }

    # Sécurité
    location ~ /\. {
        deny all;
    }
}
```

**Dans nano :**
- Appuyez sur `Ctrl+K` plusieurs fois pour supprimer tout le contenu
- Collez la nouvelle configuration (`Ctrl+Shift+V` ou clic droit)
- Sauvegardez avec `Ctrl+O`, puis `Enter`
- Quittez avec `Ctrl+X`

### Étape 5 : Tester la configuration
```bash
sudo nginx -t
```

**Vous devriez voir :**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Étape 6 : Recharger nginx
```bash
sudo systemctl reload nginx
```

### Étape 7 : Vérifier que le port 443 est ouvert
```bash
sudo ss -tlnp | grep nginx
```

**Vous devriez maintenant voir :**
```
LISTEN 0 511 0.0.0.0:80   0.0.0.0:*    users:(("nginx",...))
LISTEN 0 511 0.0.0.0:443  0.0.0.0:*    users:(("nginx",...))
```

### Étape 8 : Tester l'accès HTTPS
```bash
curl -I https://preinscription.sbcgroupe.ca
```

## Vérification finale

1. ✅ Nginx écoute sur le port 443
2. ✅ La configuration est valide
3. ✅ Le site est accessible en HTTPS

Si tout fonctionne, vous pouvez maintenant accéder à `https://preinscription.sbcgroupe.ca/` depuis votre navigateur !

