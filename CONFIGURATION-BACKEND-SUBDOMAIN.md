# Configuration du sous-domaine backend.sbcgroupe.ca

## Étapes à suivre sur le serveur

### 1. Obtenir les certificats SSL pour backend.sbcgroupe.ca

```bash
# Installer certbot si nécessaire
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtenir les certificats pour le sous-domaine
sudo certbot certonly --nginx -d backend.sbcgroupe.ca
```

### 2. Créer le fichier de configuration nginx

```bash
sudo nano /etc/nginx/sites-available/backend.sbcgroupe.ca
```

**Copiez-collez le contenu du fichier `nginx-backend-subdomain.conf`**

### 3. Activer la configuration

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/backend.sbcgroupe.ca /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger nginx
sudo systemctl reload nginx
```

### 4. Vérifier que le sous-domaine fonctionne

```bash
# Vérifier les ports
sudo ss -tlnp | grep nginx

# Tester l'API
curl -I https://backend.sbcgroupe.ca/api/countries
```

### 5. Mettre à jour le frontend

Le frontend a déjà été mis à jour pour utiliser `https://backend.sbcgroupe.ca/api` au lieu de `/api`.

**Si vous devez rebuilder le frontend :**

```bash
cd /home/deploy/pr-inscription/frontend
npm run build
```

### 6. (Optionnel) Supprimer la section /api de la config frontend

Puisque vous utilisez maintenant un sous-domaine séparé, vous pouvez supprimer la section `/api` de `/etc/nginx/sites-available/preinscription` pour simplifier la configuration.

## Configuration DNS

Assurez-vous que le DNS pointe correctement :
- `backend.sbcgroupe.ca` → `72.61.3.184` (déjà configuré selon vous)

## Vérification finale

1. ✅ Certificats SSL pour backend.sbcgroupe.ca
2. ✅ Configuration nginx activée
3. ✅ Frontend mis à jour
4. ✅ Test : `https://backend.sbcgroupe.ca/api/countries` fonctionne

## Avantages de cette approche

- ✅ Configuration plus simple (pas de rewrite complexe)
- ✅ Séparation claire frontend/backend
- ✅ Plus facile à maintenir
- ✅ Meilleure sécurité (isolation)
- ✅ Possibilité de scaler séparément

