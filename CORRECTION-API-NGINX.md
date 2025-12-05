# Correction de la configuration API Nginx

## Problème
- `/api/countries` retourne 404
- `/api/` retourne 403 Forbidden

## Solution : Configuration corrigée pour Laravel

Remplacez la section API dans `/etc/nginx/sites-available/preinscription` par cette configuration :

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

        # Rediriger toutes les requêtes vers index.php de Laravel
        try_files $uri $uri/ /api/index.php?$query_string;
    }

    # ------------------------------
    # PHP FPM – Laravel index.php pour /api/*
    # ------------------------------
    location ~ ^/api/index\.php$ {
        root /home/deploy/pr-inscription/backend/public;
        
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;

        fastcgi_param SCRIPT_FILENAME /home/deploy/pr-inscription/backend/public/index.php;
        fastcgi_param REQUEST_URI $request_uri;

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

## Commandes à exécuter sur le serveur

### Option 1 : Éditer avec nano
```bash
sudo nano /etc/nginx/sites-available/preinscription
```

Remplacez la section API (lignes 73-110 environ) par la configuration ci-dessus.

### Option 2 : Utiliser sed pour remplacer automatiquement

**ATTENTION :** Sauvegardez d'abord !
```bash
sudo cp /etc/nginx/sites-available/preinscription /etc/nginx/sites-available/preinscription.backup.api
```

Puis testez la configuration :
```bash
sudo nginx -t
```

Si OK, rechargez :
```bash
sudo systemctl reload nginx
```

### Vérification

Testez l'API :
```bash
curl -I https://preinscription.sbcgroupe.ca/api/countries
```

Vous devriez obtenir une réponse 200 ou 401 (pas 404).

## Alternative : Configuration avec rewrite (si try_files ne fonctionne pas)

Si la configuration ci-dessus ne fonctionne toujours pas, essayez cette version avec rewrite :

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

        # Rediriger toutes les requêtes vers index.php de Laravel
        rewrite ^/api/(.*)$ /api/index.php/$1?$query_string last;
    }

    # ------------------------------
    # PHP FPM – Laravel index.php pour /api/*
    # ------------------------------
    location ~ ^/api/index\.php {
        root /home/deploy/pr-inscription/backend/public;
        
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;

        fastcgi_param SCRIPT_FILENAME /home/deploy/pr-inscription/backend/public/index.php;
        fastcgi_param REQUEST_URI $request_uri;

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

## Vérification des logs

Si ça ne fonctionne toujours pas, vérifiez les logs :
```bash
# Logs nginx
sudo tail -50 /var/log/nginx/preinscription-error.log

# Logs Laravel
sudo tail -50 /home/deploy/pr-inscription/backend/storage/logs/laravel.log
```

