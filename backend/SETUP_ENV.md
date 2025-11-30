# Configuration du fichier .env

Le fichier `.env` n'est pas versionné pour des raisons de sécurité. Vous devez le créer manuellement.

## Méthode 1 : Copier depuis .env.example (Recommandé)

### Sur Windows (PowerShell) :
```powershell
cd backend
copy .env.example .env
```

### Sur Windows (CMD) :
```cmd
cd backend
copy .env.example .env
```

### Sur Linux/Mac :
```bash
cd backend
cp .env.example .env
```

## Méthode 2 : Créer manuellement

Créez un fichier nommé `.env` dans le dossier `backend/` avec le contenu suivant :

```env
APP_NAME="TFKS Preinscription"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_TIMEZONE=UTC
APP_URL=http://localhost:8000
APP_LOCALE=fr
APP_FALLBACK_LOCALE=fr
APP_FAKER_LOCALE=fr_FR

APP_MAINTENANCE_DRIVER=file
APP_MAINTENANCE_STORE=database

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=tfks_preinscription
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe_postgres

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

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
MAIL_PASSWORD=votre_mot_de_passe_application_gmail
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

## Après avoir créé le fichier .env

1. **Générer la clé d'application** :
   ```bash
   php artisan key:generate
   ```

2. **Configurer votre base de données PostgreSQL** :
   - Modifiez `DB_DATABASE`, `DB_USERNAME`, et `DB_PASSWORD` selon votre configuration

3. **Configurer l'email SMTP** :
   - Pour Gmail, vous devez créer un "Mot de passe d'application" dans les paramètres de votre compte Google
   - Remplacez `MAIL_PASSWORD` par ce mot de passe d'application

4. **Créer la base de données** :
   ```sql
   CREATE DATABASE tfks_preinscription;
   ```

5. **Exécuter les migrations** :
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

## Vérification

Vérifiez que le fichier `.env` existe bien :
```bash
# Windows
dir .env

# Linux/Mac
ls -la .env
```


















