# Structure du Projet TFKS

## Vue d'ensemble

Ce projet est une plateforme complète de gestion de préinscriptions pour voyages d'étude, composée d'un backend Laravel 11 et d'un frontend React avec Vite.

## Architecture

```
S/
├── backend/                    # Application Laravel (API REST)
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/        # Contrôleurs API
│   │   │   ├── Middleware/     # Middlewares personnalisés
│   │   │   └── Requests/       # Form Requests (validation)
│   │   ├── Models/             # Modèles Eloquent
│   │   ├── Repositories/       # Repository Pattern
│   │   ├── Services/          # Services métier
│   │   └── Mail/              # Classes Mail
│   ├── database/
│   │   ├── migrations/         # Migrations de base de données
│   │   └── seeders/           # Seeders pour données initiales
│   ├── routes/
│   │   └── api.php            # Routes API
│   ├── config/                # Fichiers de configuration
│   └── resources/
│       └── views/
│           └── emails/         # Templates email Blade
│
├── frontend/                   # Application React
│   ├── src/
│   │   ├── components/        # Composants réutilisables
│   │   ├── contexts/          # Contextes React (Auth)
│   │   ├── pages/             # Pages de l'application
│   │   │   ├── client/        # Pages client
│   │   │   └── admin/         # Pages admin
│   │   └── services/          # Services API
│   ├── public/                # Fichiers statiques
│   └── package.json           # Dépendances NPM
│
├── README.md                   # Documentation principale
├── INSTALLATION.md            # Guide d'installation
└── PROJET_STRUCTURE.md        # Ce fichier
```

## Base de données

### Tables principales

1. **users** - Utilisateurs (admin/client)
2. **countries** - Pays disponibles pour préinscription
3. **inscriptions** - Préinscriptions des clients
4. **documents** - Documents uploadés par les clients
5. **messages** - Messages du chat
6. **news** - Actualités publiées
7. **reviews** - Avis des clients
8. **agency_settings** - Paramètres de l'agence

## API Endpoints

### Authentification
- `POST /api/register` - Inscription
- `POST /api/login` - Connexion
- `POST /api/logout` - Déconnexion
- `GET /api/me` - Utilisateur connecté

### Préinscriptions
- `GET /api/inscriptions` - Liste des préinscriptions
- `POST /api/inscriptions` - Créer une préinscription
- `PATCH /api/inscriptions/{id}/status` - Modifier le statut (admin)

### Documents
- `GET /api/documents` - Liste des documents
- `POST /api/documents` - Uploader un document
- `GET /api/documents/{id}/download` - Télécharger un document
- `DELETE /api/documents/{id}` - Supprimer un document

### Messages
- `GET /api/messages/conversations` - Liste des conversations
- `GET /api/messages/{user?}` - Messages d'une conversation
- `POST /api/messages` - Envoyer un message
- `GET /api/messages/unread/count` - Nombre de messages non lus

### Actualités
- `GET /api/news` - Liste des actualités publiées
- `POST /api/news` - Créer une actualité (admin)
- `PUT /api/news/{id}` - Modifier une actualité (admin)
- `DELETE /api/news/{id}` - Supprimer une actualité (admin)

### Avis
- `GET /api/reviews` - Liste des avis approuvés
- `POST /api/reviews` - Créer un avis
- `PATCH /api/reviews/{id}/status` - Modifier le statut (admin)
- `DELETE /api/reviews/{id}` - Supprimer un avis (admin)

### Pays
- `GET /api/countries` - Liste des pays
- `POST /api/countries` - Créer un pays (admin)

### Agence
- `GET /api/agency` - Informations de l'agence
- `PUT /api/agency` - Modifier les informations (admin)

### Utilisateurs (Admin)
- `GET /api/users` - Liste des clients
- `GET /api/users/{id}` - Détails d'un client
- `PUT /api/users/{id}` - Modifier un client
- `DELETE /api/users/{id}` - Supprimer un client

## Fonctionnalités

### Client/Étudiant
- ✅ Inscription et authentification
- ✅ Page d'accueil avec informations agence
- ✅ Gestion des préinscriptions
- ✅ Upload de documents
- ✅ Chat temps réel avec admin
- ✅ Suivi de l'état des préinscriptions
- ✅ Publication d'avis après validation

### Administrateur
- ✅ Dashboard avec statistiques
- ✅ Gestion des clients
- ✅ Gestion des préinscriptions (validation/rejet)
- ✅ Gestion des actualités (texte, images, vidéos)
- ✅ Modération des avis
- ✅ Chat avec clients
- ✅ Paramètres de l'agence

## Technologies utilisées

### Backend
- Laravel 11
- Laravel Sanctum (authentification)
- PostgreSQL
- SMTP (emails)

### Frontend
- React 18
- Vite
- React Router
- Tailwind CSS
- Axios
- Socket.io (chat temps réel)
- React Player (vidéos)

## Sécurité

- Authentification via Laravel Sanctum
- Middleware pour protéger les routes admin
- Validation des données via Form Requests
- Protection CSRF
- Hashage des mots de passe (bcrypt)

## Emails automatiques

- Email de bienvenue lors de l'inscription
- Notification admin lors d'une nouvelle inscription
- Configuration SMTP dans `.env`

## Notes importantes

1. Le chat temps réel nécessite un serveur WebSocket (Pusher ou Laravel WebSockets)
2. Les fichiers uploadés sont stockés dans `storage/app/public`
3. Le lien symbolique `storage` doit être créé avec `php artisan storage:link`
4. Pour la production, configurez les variables d'environnement appropriées














