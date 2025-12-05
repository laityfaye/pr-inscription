# Mise à jour de la configuration API sur le serveur

## Configuration corrigée à copier

Sur votre serveur, exécutez cette commande pour remplacer la section API :

```bash
# 1. Sauvegarder
sudo cp /etc/nginx/sites-available/preinscription /etc/nginx/sites-available/preinscription.backup.api

# 2. Éditer le fichier
sudo nano /etc/nginx/sites-available/preinscription
```

**Remplacez la section API (environ lignes 73-122) par :**

```nginx
    # ------------------------------
    # API Laravel – /api/*
    # ------------------------------
    location /api {
        # CORS headers
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials "true" always;

        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin $http_origin always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-Requested-With" always;
            add_header Access-Control-Allow-Credentials "true" always;
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }

        # Capturer l'URI original avant le rewrite
        set $laravel_uri $request_uri;
        
        # Rediriger toutes les requêtes /api/* vers index.php
        rewrite ^/api/(.*)$ /api/index.php last;
    }

    # ------------------------------
    # PHP FPM – Laravel index.php pour /api/*
    # ------------------------------
    location ~ ^/api/index\.php {
        root /home/deploy/pr-inscription/backend/public;
        
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;

        fastcgi_param SCRIPT_FILENAME /home/deploy/pr-inscription/backend/public/index.php;
        # Utiliser l'URI original capturé pour que Laravel puisse router correctement
        fastcgi_param REQUEST_URI $laravel_uri;

        fastcgi_read_timeout 300;
        fastcgi_send_timeout 300;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 4 256k;
        fastcgi_busy_buffers_size 256k;

        # CORS headers
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials "true" always;
    }
```

## Commandes à exécuter après modification

```bash
# 1. Tester la configuration
sudo nginx -t

# 2. Si OK, recharger nginx
sudo systemctl reload nginx

# 3. Tester l'API
curl -I https://preinscription.sbcgroupe.ca/api/countries
```

## Vérification

Vous devriez maintenant obtenir :
- `/api/countries` → 200 OK (ou 401 si non authentifié, mais pas 404)
- `/api/` → 200 OK (ou 401, mais pas 403)

## Si ça ne fonctionne toujours pas

Vérifiez les logs :
```bash
# Logs nginx
sudo tail -50 /var/log/nginx/preinscription-error.log

# Logs Laravel
sudo tail -50 /home/deploy/pr-inscription/backend/storage/logs/laravel.log
```

