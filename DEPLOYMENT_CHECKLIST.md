# Checklist de Déploiement - TFKS Platform

## ✅ Checklist de Déploiement

### Préparation
- [ ] Connexion au serveur root@srv1186446
- [ ] Mise à jour du système
- [ ] Installation des dépendances de base

### Utilisateur
- [ ] Création de l'utilisateur TFKS
- [ ] Ajout au groupe sudo
- [ ] Création du répertoire /home/TFKS/projects
- [ ] Configuration des permissions

### Node.js
- [ ] Installation de Node.js 18.x
- [ ] Installation de npm
- [ ] Installation de PM2
- [ ] Vérification des versions

### PHP
- [ ] Installation de PHP 8.1 et extensions
- [ ] Installation de Composer
- [ ] Vérification de PHP-FPM
- [ ] Configuration PHP-FPM

### PostgreSQL
- [ ] Installation de PostgreSQL
- [ ] Démarrage de PostgreSQL
- [ ] Création de la base de données tfksdb
- [ ] Création de l'utilisateur tfksuser
- [ ] Attribution des privilèges
- [ ] Configuration de l'authentification

### Nginx
- [ ] Installation de Nginx
- [ ] Configuration backend (tfksbackend.innosft.com)
- [ ] Configuration frontend (tfksservice.innosft.com)
- [ ] Activation des sites
- [ ] Test de configuration
- [ ] Redémarrage de Nginx

### SSL
- [ ] Installation de Certbot
- [ ] Configuration SSL pour backend
- [ ] Configuration SSL pour frontend
- [ ] Test de renouvellement automatique

### Backend
- [ ] Clonage/transfert du projet
- [ ] Installation des dépendances Composer
- [ ] Configuration du fichier .env
- [ ] Génération de la clé d'application
- [ ] Migration de la base de données
- [ ] Seed de la base de données
- [ ] Optimisation pour production
- [ ] Configuration des permissions

### Frontend
- [ ] Clonage/transfert du projet
- [ ] Installation des dépendances npm
- [ ] Configuration .env.production
- [ ] Build de production
- [ ] Configuration des permissions

### PM2 (si nécessaire)
- [ ] Configuration ecosystem.config.js
- [ ] Démarrage avec PM2
- [ ] Configuration du démarrage automatique

### Firewall
- [ ] Installation d'UFW
- [ ] Configuration des règles
- [ ] Activation du firewall

### Scripts
- [ ] Création du script deploy-backend.sh
- [ ] Création du script deploy-frontend.sh
- [ ] Création du script backup-db.sh
- [ ] Configuration de la tâche cron pour sauvegarde

### Tests
- [ ] Test backend : https://tfksbackend.innosft.com
- [ ] Test frontend : https://tfksservice.innosft.com
- [ ] Test de connexion à la base de données
- [ ] Test des API endpoints
- [ ] Vérification des logs

### Sécurité
- [ ] Vérification des permissions
- [ ] Configuration des sauvegardes
- [ ] Vérification des logs d'erreur
- [ ] Test de sécurité SSL

---

## 🔑 Informations de Connexion

- **Serveur** : root@srv1186446
- **Utilisateur système** : tfksservice
- **Chemin des projets** : ~/pr-inscription/
- **Mot de passe** : InnoSoft#123@
- **Base de données** : tfksdb
- **Utilisateur PostgreSQL** : tfksuser
- **Backend URL** : https://tfksbackend.innosft.com
- **Frontend URL** : https://tfksservice.innosft.com

---

## 📝 Commandes Rapides

### Connexion
```bash
ssh tfksservice@srv1186446
cd ~/pr-inscription
```

### Redémarrer les services
```bash
sudo systemctl restart nginx
sudo systemctl restart php8.1-fpm
sudo systemctl restart postgresql
```

### Voir les logs
```bash
# Nginx
sudo tail -f /var/log/nginx/error.log

# PHP-FPM
sudo tail -f /var/log/php8.1-fpm.log

# Laravel
tail -f ~/pr-inscription/backend/storage/logs/laravel.log
```

### Déploiement rapide
```bash
# Backend
~/deploy-backend.sh

# Frontend
~/deploy-frontend.sh
```

### Sauvegarde
```bash
~/backup-db.sh
```

---

## 🚨 En cas de problème

1. Vérifier les logs d'erreur
2. Vérifier le statut des services
3. Vérifier les permissions
4. Vérifier la configuration Nginx
5. Vérifier la connexion à la base de données

