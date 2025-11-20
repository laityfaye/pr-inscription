# Guide d'Installation - Plateforme TFKS

## Prérequis

- PHP >= 8.2
- Composer
- Node.js >= 18
- PostgreSQL >= 14
- NPM ou Yarn

## Installation Backend (Laravel)

### 1. Installer les dépendances

```bash
cd backend
composer install
```

### 2. Configuration de l'environnement

```bash
cp .env.example .env
php artisan key:generate
```

### 3. Configuration de la base de données

Modifier le fichier `.env` :

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=tfks_preinscription
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe
```

### 4. Créer la base de données

```sql
CREATE DATABASE tfks_preinscription;
```

### 5. Exécuter les migrations

```bash
php artisan migrate
php artisan db:seed
```

### 6. Créer le lien symbolique pour le stockage

```bash
php artisan storage:link
```

### 7. Configuration Email SMTP

Modifier le fichier `.env` :

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=laityfaye1709@gmail.com
MAIL_PASSWORD=votre_mot_de_passe_application
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=laityfaye1709@gmail.com
MAIL_FROM_NAME="TFKS Preinscription"
ADMIN_EMAIL=laityfaye1709@gmail.com
```

**Note:** Pour Gmail, vous devez créer un "Mot de passe d'application" dans les paramètres de votre compte Google.

### 8. Démarrer le serveur

**Pour un accès local uniquement :**
```bash
php artisan serve
```

**Pour permettre l'accès depuis d'autres appareils sur le réseau local :**
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

Le serveur sera accessible sur :
- `http://localhost:8000` (depuis la machine locale)
- `http://VOTRE_IP_LOCALE:8000` (depuis d'autres appareils sur le même réseau Wi-Fi)

**Note importante :** Pour accéder à la plateforme depuis un autre appareil (téléphone, tablette, etc.), vous devez :
1. Démarrer le serveur Laravel avec `--host=0.0.0.0`
2. Démarrer le frontend avec `npm run dev` (déjà configuré pour accepter les connexions réseau)
3. Accéder à la plateforme via l'adresse IP locale de votre ordinateur (ex: `http://192.168.1.100:3000`)

### 9. (Optionnel) Démarrer la queue pour les emails

```bash
php artisan queue:work
```

## Installation Frontend (React)

### 1. Installer les dépendances

```bash
cd frontend
npm install
```

### 2. Démarrer le serveur de développement

```bash
npm run dev
```

Le frontend sera accessible sur `http://localhost:3000`

### 3. Build de production

```bash
npm run build
```

## Configuration CORS

Le backend est configuré pour accepter les requêtes depuis `http://localhost:3000`. Si vous utilisez un autre port, modifiez `backend/config/cors.php` ou `backend/bootstrap/app.php`.

## Comptes par défaut

Après le seeding :

- **Admin:**
  - Email: `admin@tfks.com`
  - Password: `password`

- **Client de test:**
  - Email: `client@test.com`
  - Password: `password`

## Structure des dossiers

```
S/
├── backend/              # Application Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   └── Requests/
│   │   ├── Models/
│   │   ├── Repositories/
│   │   ├── Services/
│   │   └── Mail/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
│       └── api.php
├── frontend/             # Application React
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   │   ├── client/
│   │   │   └── admin/
│   │   └── services/
│   └── package.json
└── README.md
```

## Dépannage

### Erreur "Connection timed out" depuis un autre appareil

Si vous obtenez une erreur "Connection timed out" lorsque vous essayez d'accéder à la plateforme depuis un autre appareil sur le même réseau Wi-Fi :

1. **Vérifiez que le serveur Laravel écoute sur toutes les interfaces :**
   ```bash
   php artisan serve --host=0.0.0.0 --port=8000
   ```
   Au lieu de simplement `php artisan serve` (qui écoute seulement sur localhost)

2. **Vérifiez votre adresse IP locale :**
   - Windows : `ipconfig` (cherchez l'adresse IPv4)
   - Linux/Mac : `ifconfig` ou `ip addr`
   - Utilisez cette adresse IP pour accéder à la plateforme : `http://VOTRE_IP:3000`

3. **Vérifiez le pare-feu Windows :**
   - Autorisez les connexions entrantes sur les ports 3000 et 8000
   - Paramètres Windows → Pare-feu → Autoriser une application

4. **Vérifiez que les deux serveurs sont démarrés :**
   - Backend Laravel : `php artisan serve --host=0.0.0.0`
   - Frontend React : `npm run dev` (déjà configuré pour accepter les connexions réseau)

### Erreur de connexion à la base de données

- Vérifiez que PostgreSQL est démarré
- Vérifiez les identifiants dans `.env`
- Vérifiez que la base de données existe

### Erreur CORS

- Vérifiez que le frontend est sur le bon port
- Vérifiez la configuration CORS dans Laravel

### Emails non envoyés

- Vérifiez la configuration SMTP dans `.env`
- Vérifiez que la queue est démarrée (`php artisan queue:work`)
- Vérifiez les logs dans `storage/logs/laravel.log`

### Problèmes de permissions (Linux/Mac)

```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

## Support

Pour toute question ou problème, consultez les logs :
- Backend: `backend/storage/logs/laravel.log`
- Frontend: Console du navigateur (F12)











