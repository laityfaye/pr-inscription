# Guide de Déploiement - TFKS Platform

## Informations du Serveur

- **Serveur** : root@srv1186446:~#
- **Utilisateur système** : tfksservice
- **Domaine** : innosft.com
- **Backend** : tfksbackend.innosft.com
- **Frontend** : tfksservice.innosft.com
- **Base de données** : tfksdb
- **Utilisateur PostgreSQL** : tfksuser
- **Mot de passe** : InnoSoft#123@
- **Chemin des projets** : ~/pr-inscription/

---

## Étape 1 : Préparation du Serveur

### 1.1 Connexion au serveur

```bash
ssh root@srv1186446
```

### 1.2 Mise à jour du système

```bash
apt update && apt upgrade -y
```

### 1.3 Installation des dépendances de base

```bash
apt install -y curl wget git unzip software-properties-common
```

---

## Étape 2 : Utilisation de l'utilisateur tfksservice

### 2.1 Vérifier l'utilisateur

L'utilisateur `tfksservice` existe déjà sur le serveur. Vérifiez que vous êtes connecté avec cet utilisateur :

```bash
whoami
# Devrait afficher : tfksservice
```

### 2.2 Créer le répertoire de travail (si nécessaire)

```bash
mkdir -p ~/pr-inscription
cd ~/pr-inscription
```

### 2.3 Vérifier les permissions

```bash
ls -la ~/pr-inscription
```

---

## Étape 3 : Installation de Node.js et npm

### 3.1 Installation de Node.js (version 18 LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3.2 Vérification de l'installation

```bash
node --version
npm --version
```

### 3.3 Installation de PM2 (gestionnaire de processus)

```bash
sudo npm install -g pm2
```

---

## Étape 4 : Installation de PHP et extensions

### 4.1 Installation de PHP 8.1 et extensions nécessaires

```bash
sudo apt install -y php8.1 php8.1-fpm php8.1-cli php8.1-common php8.1-pgsql php8.1-zip php8.1-gd php8.1-mbstring php8.1-curl php8.1-xml php8.1-bcmath php8.1-intl php8.1-readline
```

### 4.2 Vérification de l'installation

```bash
php --version
```

### 4.3 Installation de Composer

```bash
cd ~
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer
```

### 4.4 Vérification de Composer

```bash
composer --version
```

---

## Étape 5 : Installation de PostgreSQL

### 5.1 Installation de PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
```

### 5.2 Démarrage de PostgreSQL

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 5.3 Création de la base de données et de l'utilisateur

#### Option 1 : Création via ligne de commande (Recommandé)

```bash
# Créer l'utilisateur PostgreSQL
sudo -u postgres createuser tfksuser -P
# Entrez le mot de passe : InnoSoft#123@

# Créer la base de données avec l'utilisateur comme propriétaire
sudo -u postgres createdb tfksdb -O tfksuser
```

#### Option 2 : Création via psql

```bash
# Basculer vers l'utilisateur postgres
sudo -u postgres psql
```

Dans PostgreSQL, exécutez :

```sql
-- Créer l'utilisateur tfksuser
CREATE USER tfksuser WITH PASSWORD 'InnoSoft#123@';

-- Créer la base de données tfksdb
CREATE DATABASE tfksdb OWNER tfksuser ENCODING 'UTF8' LC_COLLATE='fr_FR.UTF-8' LC_CTYPE='fr_FR.UTF-8';

-- Accorder tous les privilèges à l'utilisateur tfksuser
GRANT ALL PRIVILEGES ON DATABASE tfksdb TO tfksuser;

-- Se connecter à la base de données tfksdb
\c tfksdb

-- Accorder les privilèges sur le schéma public
GRANT ALL ON SCHEMA public TO tfksuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO tfksuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO tfksuser;

-- Quitter PostgreSQL
\q
```

### 5.4 Configuration de PostgreSQL pour l'authentification locale

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Assurez-vous que la ligne suivante existe (pour l'authentification locale) :

```
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

Rechargez PostgreSQL :

```bash
sudo systemctl restart postgresql
```

### 5.5 Test de connexion

```bash
psql -U tfksuser -d tfksdb -h localhost
# Entrez le mot de passe : InnoSoft#123@
# Tapez \q pour quitter
```

---

## Étape 6 : Installation et configuration de Nginx

### 6.1 Installation de Nginx

```bash
sudo apt install -y nginx
```

### 6.2 Démarrage de Nginx

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6.3 Configuration du backend (tfksbackend.innosft.com)

```bash
sudo nano /etc/nginx/sites-available/tfksbackend
```

Ajoutez la configuration suivante :

```nginx
server {
    listen 80;
    server_name tfksbackend.innosft.com;
    root /home/tfksservice/pr-inscription/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### 6.4 Configuration du frontend (tfksservice.innosft.com)

```bash
sudo nano /etc/nginx/sites-available/tfksservice
```

Ajoutez la configuration suivante :

```nginx
server {
    listen 80;
    server_name tfksservice.innosft.com;
    root /home/tfksservice/pr-inscription/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 6.5 Activation des sites

```bash
sudo ln -s /etc/nginx/sites-available/tfksbackend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/tfksservice /etc/nginx/sites-enabled/
```

### 6.6 Test de la configuration Nginx

```bash
sudo nginx -t
```

### 6.7 Rechargement de Nginx

```bash
sudo systemctl reload nginx
```

---

## Étape 7 : Installation de Certbot (SSL)

### 7.1 Installation de Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Configuration SSL pour le backend

```bash
sudo certbot --nginx -d tfksbackend.innosft.com
# Suivez les instructions à l'écran
```

### 7.3 Configuration SSL pour le frontend

```bash
sudo certbot --nginx -d tfksservice.innosft.com
# Suivez les instructions à l'écran
```

### 7.4 Renouvellement automatique

Certbot configure automatiquement le renouvellement. Vous pouvez tester avec :

```bash
sudo certbot renew --dry-run
```

---

## Étape 8 : Déploiement du Backend (Laravel)

### 8.1 Cloner ou transférer le projet backend

```bash
cd ~/pr-inscription
# Option 1 : Cloner depuis Git
git clone <votre-repo-backend> backend
# Option 2 : Transférer via SCP depuis votre machine locale
# scp -r backend/ tfksservice@srv1186446:~/pr-inscription/
```

### 8.2 Installation des dépendances

```bash
cd ~/pr-inscription/backend
composer install --optimize-autoloader --no-dev
```

### 8.3 Configuration de l'environnement

```bash
cp .env.example .env
nano .env
```

Configurez le fichier `.env` avec la configuration complète suivante :

```env
APP_NAME="TFKS Preinscription"
APP_ENV=production
APP_KEY=base64:GuMebh27jv1eR2G5jzXYt4czZ6gzhNE91MPfTMSOl9o=
APP_DEBUG=false
APP_TIMEZONE=UTC
APP_URL=https://tfksbackend.innosft.com
FRONTEND_URL=https://tfksservice.innosft.com
SANCTUM_STATEFUL_DOMAINS=tfksservice.innosft.com,tfksbackend.innosft.com,innosft.com,localhost,localhost:3000,127.0.0.1,127.0.0.1:8000
SESSION_DOMAIN=.innosft.com
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
APP_LOCALE=fr
APP_FALLBACK_LOCALE=fr
APP_FAKER_LOCALE=fr_FR

APP_MAINTENANCE_DRIVER=file
APP_MAINTENANCE_STORE=database

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=tfksdb
DB_USERNAME=tfksuser
DB_PASSWORD="InnoSoft#123@"

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
CACHE_PREFIX=

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=laityfaye1709@gmail.com
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=laityfaye1709@gmail.com
MAIL_FROM_NAME="${APP_NAME}"

ADMIN_EMAIL=laityfaye1709@gmail.com

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1
```

**Note importante** : 
- Remplacez `APP_KEY` par la clé générée avec `php artisan key:generate` si nécessaire
- Configurez `MAIL_PASSWORD` avec votre mot de passe d'application Gmail
- Les autres variables peuvent être configurées selon vos besoins

### 8.4 Génération de la clé d'application

```bash
php artisan key:generate
```

### 8.5 Migration de la base de données

```bash
php artisan migrate --force
php artisan db:seed --force
```

### 8.6 Optimisation pour la production

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 8.7 Configuration des permissions

```bash
sudo chown -R tfksservice:www-data ~/pr-inscription/backend
sudo chmod -R 755 ~/pr-inscription/backend
sudo chmod -R 775 ~/pr-inscription/backend/storage
sudo chmod -R 775 ~/pr-inscription/backend/bootstrap/cache
```

---

## Étape 9 : Déploiement du Frontend (React)

### 9.1 Cloner ou transférer le projet frontend

```bash
cd ~/pr-inscription
# Option 1 : Cloner depuis Git
git clone <votre-repo-frontend> frontend
# Option 2 : Transférer via SCP depuis votre machine locale
# scp -r frontend/ tfksservice@srv1186446:~/pr-inscription/
```

### 9.2 Installation des dépendances

```bash
cd ~/pr-inscription/frontend
npm install
```

### 9.3 Configuration de l'environnement

Créez un fichier `.env.production` :

```bash
nano .env.production
```

Ajoutez :

```env
VITE_API_URL=https://tfksbackend.innosft.com/api
# Ajoutez d'autres variables d'environnement si nécessaire
```

### 9.4 Build de production

```bash
npm run build
```

Cela créera un dossier `dist` avec les fichiers optimisés.

### 9.5 Configuration des permissions

```bash
sudo chown -R tfksservice:www-data ~/pr-inscription/frontend
sudo chmod -R 755 ~/pr-inscription/frontend
```

---

## Étape 10 : Configuration de PM2 pour le Backend (si nécessaire)

Si vous avez des tâches en arrière-plan ou des workers, configurez PM2 :

### 10.1 Créer un fichier de configuration PM2

```bash
cd ~/pr-inscription/backend
nano ecosystem.config.js
```

Ajoutez :

```javascript
module.exports = {
  apps: [{
    name: 'tfks-backend',
    script: 'php',
    args: 'artisan queue:work --sleep=3 --tries=3',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

### 10.2 Démarrer avec PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Étape 11 : Configuration du Firewall

### 11.1 Installation d'UFW (si pas déjà installé)

```bash
sudo apt install -y ufw
```

### 11.2 Configuration du firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 11.3 Vérification

```bash
sudo ufw status
```

---

## Étape 12 : Configuration CORS (si nécessaire)

Si vous avez des problèmes CORS, modifiez le fichier de configuration Laravel :

```bash
nano ~/pr-inscription/backend/config/cors.php
```

Assurez-vous que les origines autorisées incluent votre frontend :

```php
'allowed_origins' => ['https://tfksservice.innosft.com'],
```

---

## Étape 13 : Vérification finale

### 13.1 Vérifier que Nginx fonctionne

```bash
sudo systemctl status nginx
```

### 13.2 Vérifier que PHP-FPM fonctionne

```bash
sudo systemctl status php8.1-fpm
```

### 13.3 Vérifier que PostgreSQL fonctionne

```bash
sudo systemctl status postgresql
```

### 13.4 Tester les URLs

- Backend : https://tfksbackend.innosft.com
- Frontend : https://tfksservice.innosft.com

---

## Étape 14 : Scripts de déploiement automatique

### 14.1 Script de déploiement backend

Créez un script pour faciliter les futurs déploiements :

```bash
nano ~/deploy-backend.sh
```

Ajoutez :

```bash
#!/bin/bash
cd ~/pr-inscription/backend
git pull origin main
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
sudo systemctl reload php8.1-fpm
echo "Backend déployé avec succès!"
```

Rendez-le exécutable :

```bash
chmod +x ~/deploy-backend.sh
```

### 14.2 Script de déploiement frontend

```bash
nano ~/deploy-frontend.sh
```

Ajoutez :

```bash
#!/bin/bash
cd ~/pr-inscription/frontend
git pull origin main
npm install
npm run build
sudo systemctl reload nginx
echo "Frontend déployé avec succès!"
```

Rendez-le exécutable :

```bash
chmod +x ~/deploy-frontend.sh
```

---

## Étape 15 : Sauvegarde automatique

### 15.1 Script de sauvegarde de la base de données

```bash
nano ~/backup-db.sh
```

Ajoutez :

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/backups"
mkdir -p $BACKUP_DIR
PGPASSWORD='InnoSoft#123@' pg_dump -U tfksuser -h localhost tfksdb > $BACKUP_DIR/tfksdb_$DATE.sql
# Garder seulement les 7 derniers backups
ls -t $BACKUP_DIR/tfksdb_*.sql | tail -n +8 | xargs rm -f
echo "Sauvegarde créée : tfksdb_$DATE.sql"
```

Rendez-le exécutable :

```bash
chmod +x ~/backup-db.sh
```

### 15.2 Ajouter une tâche cron pour la sauvegarde quotidienne

```bash
crontab -e
```

Ajoutez :

```
0 2 * * * $HOME/backup-db.sh
```

---

## Dépannage

### Problèmes courants

1. **Erreur 502 Bad Gateway**
   - Vérifiez que PHP-FPM est démarré : `sudo systemctl status php8.1-fpm`
   - Vérifiez les permissions des fichiers

2. **Erreur 403 Forbidden**
   - Vérifiez les permissions : `sudo chown -R tfksservice:www-data ~/pr-inscription`
   - Vérifiez la configuration Nginx

3. **Erreur de connexion à la base de données**
   - Vérifiez les identifiants dans `.env`
   - Vérifiez que PostgreSQL est démarré : `sudo systemctl status postgresql`

4. **Problèmes CORS**
   - Vérifiez la configuration CORS dans Laravel
   - Vérifiez que les URLs dans `.env` sont correctes

### Commandes utiles

```bash
# Voir les logs Nginx
sudo tail -f /var/log/nginx/error.log

# Voir les logs PHP-FPM
sudo tail -f /var/log/php8.1-fpm.log

# Voir les logs Laravel
tail -f ~/pr-inscription/backend/storage/logs/laravel.log

# Voir les logs PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log

# Se connecter à PostgreSQL
psql -U tfksuser -d tfksdb -h localhost

# Lister les bases de données
psql -U tfksuser -h localhost -c "\l"

# Lister les tables
psql -U tfksuser -d tfksdb -h localhost -c "\dt"

# Redémarrer les services
sudo systemctl restart nginx
sudo systemctl restart php8.1-fpm
sudo systemctl restart postgresql
```

---

## Sécurité

### Recommandations supplémentaires

1. **Changer les clés SSH par défaut**
2. **Configurer fail2ban pour protéger contre les attaques par force brute**
3. **Activer les mises à jour automatiques de sécurité**
4. **Configurer des sauvegardes régulières**
5. **Surveiller les logs régulièrement**

---

## Conclusion

Votre plateforme TFKS est maintenant déployée et accessible via :
- **Backend** : https://tfksbackend.innosft.com
- **Frontend** : https://tfksservice.innosft.com

Pour toute question ou problème, consultez les logs ou contactez l'équipe de support.

