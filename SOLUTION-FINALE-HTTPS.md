# Solution finale - Ajouter HTTPS à nginx

## Problème
Le fichier `/etc/nginx/sites-available/preinscription` ne contient PAS le bloc HTTPS (port 443).

## Solution : Remplacer complètement le fichier

### Étape 1 : Voir le contenu actuel
```bash
sudo cat /etc/nginx/sites-available/preinscription
```

### Étape 2 : Sauvegarder
```bash
sudo cp /etc/nginx/sites-available/preinscription /etc/nginx/sites-available/preinscription.backup.$(date +%Y%m%d)
```

### Étape 3 : Créer le nouveau fichier avec la configuration complète

**Option A : Utiliser cat avec heredoc (recommandé)**

Copiez-collez cette commande complète (tout le bloc) :

```bash
sudo tee /etc/nginx/sites-available/preinscription > /dev/null << 'EOF'
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
EOF
```

**Option B : Utiliser nano (si l'option A ne fonctionne pas)**

```bash
sudo nano /etc/nginx/sites-available/preinscription
```

Puis supprimez TOUT le contenu (Ctrl+K plusieurs fois) et collez la configuration complète ci-dessus.

### Étape 4 : Vérifier que le fichier est correct
```bash
sudo grep -c "listen.*443" /etc/nginx/sites-available/preinscription
# Devrait afficher: 2 (une pour IPv4, une pour IPv6)
```

### Étape 5 : Tester la configuration
```bash
sudo nginx -t
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

### Étape 8 : Vérifier les fichiers SSL requis
```bash
# Si ssl-dhparams.pem n'existe pas, créez-le :
sudo openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
```

## Si le port 443 ne démarre toujours pas

Vérifiez les logs :
```bash
sudo tail -50 /var/log/nginx/error.log
```

Causes possibles :
- Fichier `ssl-dhparams.pem` manquant
- Fichier `options-ssl-nginx.conf` manquant
- Permissions incorrectes sur les certificats

