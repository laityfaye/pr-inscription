# Configuration backend .env pour le sous-domaine

## Mise à jour du fichier .env du backend

Sur le serveur, éditez le fichier `.env` du backend :

```bash
cd /home/deploy/pr-inscription/backend
nano .env
```

## Variables à ajouter/modifier

```env
# URL du frontend (pour Sanctum)
FRONTEND_URL=https://preinscription.sbcgroupe.ca

# Domaines stateful pour Sanctum (ajoutez le domaine frontend)
SANCTUM_STATEFUL_DOMAINS=preinscription.sbcgroupe.ca,backend.sbcgroupe.ca,localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1

# URL de l'application (backend)
APP_URL=https://backend.sbcgroupe.ca

# Configuration des sessions pour le domaine parent (permet les cookies entre sous-domaines)
SESSION_DOMAIN=.sbcgroupe.ca
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
```

## Après modification

```bash
# Vider le cache de configuration
php artisan config:clear
php artisan cache:clear

# Redémarrer PHP-FPM (si nécessaire)
sudo systemctl restart php8.2-fpm
```

## Vérification

Testez l'authentification depuis le frontend. Les cookies et tokens devraient fonctionner correctement.

