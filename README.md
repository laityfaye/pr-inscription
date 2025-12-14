# Plateforme de Gestion de Préinscriptions - TFKS Touba Fall Khidma Services

## 📋 Résumé

Plateforme web complète pour la gestion de tous les services d'immigration et d'études à l'étranger. Elle permet aux clients de soumettre leurs demandes de préinscription pour voyages d'étude, de visa visiteur, de permis de travail, de résidence permanente au Canada, ainsi que de renouvellement CAQ et permis d'études. Les utilisateurs peuvent uploader leurs documents, suivre l'état de leurs démarches et communiquer en temps réel avec l'agence via un système de chat intégré. Les administrateurs peuvent gérer toutes les demandes, publier des actualités, modérer les avis et offrir un accompagnement personnalisé pour chaque type de demande.

## 🏗️ Architecture

- **Backend**: Laravel 11 (API REST)
- **Frontend**: React.js avec Vite
- **Base de données**: PostgreSQL
- **Authentification**: Laravel Sanctum
- **Chat temps réel**: Laravel Echo + Pusher/Socket.io
- **Email**: SMTP

## 📁 Structure du Projet

```
S/
├── backend/          # Application Laravel
├── frontend/         # Application React
└── README.md
```

## 🚀 Installation

### Prérequis

- PHP >= 8.2
- Composer
- Node.js >= 18
- PostgreSQL >= 14
- NPM ou Yarn

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve --host=0.0.0.0 --port=8000
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

### Configuration Base de Données

Modifier le fichier `backend/.env` :

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### Configuration Email SMTP

Modifier le fichier `backend/.env` :

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=laityfaye1709@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=laityfaye1709@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```

### Configuration Chat Temps Réel

Pour le chat temps réel, vous pouvez utiliser :
- **Pusher** (recommandé pour production)
- **Laravel WebSockets** (pour développement local)

Modifier `backend/.env` selon votre choix.

## 👤 Comptes par défaut

Après le seeding :
- **Admin**: admin@tfks.com / password
- **Client de test**: client@test.com / password

## 📝 Fonctionnalités

### Client/Étudiant
- Inscription et authentification
- Page d'accueil avec informations agence
- Upload de documents
- Chat temps réel avec admin
- Suivi de préinscription
- Publication d'avis après validation

### Administrateur
- Gestion des clients
- Gestion des actualités (texte, images, vidéos)
- Modération des avis
- Chat avec clients
- Gestion des préinscriptions
- Paramètres de l'agence

## 🔐 API Endpoints

Voir `backend/routes/api.php` pour la liste complète des endpoints.

## 📧 Notifications

Les emails sont automatiquement envoyés à `laityfaye1709@gmail.com` lors de :
- Nouvelle inscription client
- Nouveau message dans le chat

## 🛠️ Commandes Artisan

```bash
php artisan migrate
php artisan db:seed
php artisan storage:link
php artisan queue:work  # Pour les emails en queue
```

## 📄 Licence

Propriétaire - TFKS Touba Fall Khidma Services











