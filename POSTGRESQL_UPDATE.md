# Mise à Jour pour PostgreSQL

## Modifications Effectuées

Le guide de déploiement a été mis à jour pour utiliser **PostgreSQL** au lieu de MySQL.

---

## Changements Principaux

### 1. Extension PHP
- **Avant** : `php8.1-mysql`
- **Après** : `php8.1-pgsql`

### 2. Installation de la Base de Données
- **Avant** : Installation de MySQL Server
- **Après** : Installation de PostgreSQL et PostgreSQL-contrib

### 3. Création de la Base de Données

#### Ancienne méthode (MySQL)
```sql
CREATE DATABASE TFKS CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'TFKS'@'localhost' IDENTIFIED BY 'InnoSoft#123@';
GRANT ALL PRIVILEGES ON TFKS.* TO 'TFKS'@'localhost';
```

#### Nouvelle méthode (PostgreSQL)
```sql
CREATE USER tfksuser WITH PASSWORD 'InnoSoft#123@';
CREATE DATABASE tfksdb OWNER tfksuser ENCODING 'UTF8' LC_COLLATE='fr_FR.UTF-8' LC_CTYPE='fr_FR.UTF-8';
GRANT ALL PRIVILEGES ON DATABASE tfksdb TO tfksuser;
```

Ou via ligne de commande :
```bash
sudo -u postgres createuser tfksuser -P
sudo -u postgres createdb tfksdb -O tfksuser
```

### 4. Configuration .env

#### Avant (MySQL)
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
```

#### Après (PostgreSQL)
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=tfksdb
DB_USERNAME=tfksuser
DB_PASSWORD="InnoSoft#123@"
```

### 5. Script de Sauvegarde

#### Avant (MySQL)
```bash
mysqldump -u TFKS -p'InnoSoft#123@' TFKS > $BACKUP_DIR/TFKS_$DATE.sql
```

#### Après (PostgreSQL)
```bash
PGPASSWORD='InnoSoft#123@' pg_dump -U TFKS -h localhost TFKS > $BACKUP_DIR/TFKS_$DATE.sql
```

### 6. Commandes de Service

#### Avant
```bash
sudo systemctl status mysql
sudo systemctl restart mysql
```

#### Après
```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

---

## Commandes PostgreSQL Utiles

### Connexion à la base de données
```bash
psql -U tfksuser -d tfksdb -h localhost
# Entrez le mot de passe : InnoSoft#123@
```

### Commandes SQL utiles dans psql
```sql
-- Lister les bases de données
\l

-- Se connecter à une base de données
\c tfksdb

-- Lister les tables
\dt

-- Décrire une table
\d nom_table

-- Lister les utilisateurs
\du

-- Quitter
\q
```

### Sauvegarde manuelle
```bash
PGPASSWORD='InnoSoft#123@' pg_dump -U tfksuser -h localhost tfksdb > backup.sql
```

### Restauration
```bash
PGPASSWORD='InnoSoft#123@' psql -U tfksuser -d tfksdb -h localhost < backup.sql
```

### Voir les connexions actives
```sql
SELECT * FROM pg_stat_activity;
```

### Voir la taille de la base de données
```sql
SELECT pg_size_pretty(pg_database_size('tfksdb'));
```

---

## Configuration de l'Authentification

Le fichier `/etc/postgresql/*/main/pg_hba.conf` doit contenir :

```
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

Après modification, redémarrer PostgreSQL :
```bash
sudo systemctl restart postgresql
```

---

## Vérification de l'Installation

### Vérifier que PostgreSQL fonctionne
```bash
sudo systemctl status postgresql
```

### Tester la connexion
```bash
psql -U tfksuser -d tfksdb -h localhost
```

### Vérifier la version
```bash
psql --version
```

---

## Migration depuis MySQL (si nécessaire)

Si vous avez déjà une base de données MySQL et souhaitez migrer vers PostgreSQL :

1. **Exporter les données MySQL**
   ```bash
   mysqldump -u root -p tfksdb > mysql_backup.sql
   ```

2. **Utiliser un outil de migration** comme `pgloader` ou convertir manuellement le SQL

3. **Importer dans PostgreSQL**
   ```bash
   psql -U tfksuser -d tfksdb < converted_backup.sql
   ```

**Note** : La migration peut nécessiter des ajustements manuels selon la complexité de votre schéma.

---

## Avantages de PostgreSQL

- ✅ Support natif pour les types de données avancés (JSON, Array, etc.)
- ✅ Meilleure conformité aux standards SQL
- ✅ Support des transactions ACID robuste
- ✅ Extensibilité avec des extensions
- ✅ Meilleure gestion des requêtes complexes
- ✅ Support natif pour les full-text search

---

## Notes Importantes

1. **Port par défaut** : PostgreSQL utilise le port **5432** (au lieu de 3306 pour MySQL)

2. **Authentification** : PostgreSQL utilise un système d'authentification différent de MySQL (fichier `pg_hba.conf`)

3. **Syntaxe SQL** : Certaines différences de syntaxe existent entre MySQL et PostgreSQL (ex: `LIMIT` vs `LIMIT/OFFSET`, auto-increment, etc.)

4. **Laravel** : Laravel supporte nativement PostgreSQL, donc pas de changement nécessaire dans le code applicatif si vous utilisez l'ORM Eloquent.

---

## Support

Pour toute question ou problème avec PostgreSQL, consultez :
- Documentation officielle : https://www.postgresql.org/docs/
- Documentation Laravel : https://laravel.com/docs/database

