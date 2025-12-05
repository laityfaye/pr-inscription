# Guide de dépannage HTTPS - Port 443

## Problème
Nginx écoute sur le port 80 mais pas sur le port 443, ce qui cause `ERR_CONNECTION_TIMED_OUT` lors de l'accès à `https://preinscription.sbcgroupe.ca/`

## Diagnostic rapide

Exécutez le script de diagnostic :
```bash
chmod +x diagnose-https.sh
./diagnose-https.sh
```

## Solutions par ordre de probabilité

### 1. Certificats SSL manquants (cause la plus fréquente)

Si les certificats Let's Encrypt n'existent pas, nginx ne peut pas démarrer le serveur HTTPS.

**Vérification :**
```bash
ls -la /etc/letsencrypt/live/preinscription.sbcgroupe.ca/
```

**Solution :**
```bash
# Installer certbot si nécessaire
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtenir les certificats
sudo certbot certonly --nginx -d preinscription.sbcgroupe.ca

# Recharger nginx
sudo systemctl reload nginx
```

### 2. Pare-feu bloque le port 443

**Vérification UFW :**
```bash
sudo ufw status
```

**Solution :**
```bash
# Ouvrir les ports HTTP et HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Vérifier
sudo ufw status
```

**Si vous utilisez iptables :**
```bash
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables-save
```

### 3. Erreur dans la configuration Nginx

**Vérification :**
```bash
sudo nginx -t
```

**Si erreur, vérifiez :**
- Les chemins des certificats SSL sont corrects
- Les fichiers de configuration Let's Encrypt existent :
  - `/etc/letsencrypt/options-ssl-nginx.conf`
  - `/etc/letsencrypt/ssl-dhparams.pem`

**Créer ssl-dhparams.pem si manquant :**
```bash
sudo openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
```

### 4. Nginx n'a pas été rechargé

Après avoir modifié la configuration ou installé les certificats :

```bash
# Tester la configuration
sudo nginx -t

# Recharger (sans interruption)
sudo systemctl reload nginx

# OU redémarrer si nécessaire
sudo systemctl restart nginx
```

### 5. Vérifier les logs d'erreur

```bash
# Logs généraux
sudo tail -50 /var/log/nginx/error.log

# Logs spécifiques au site
sudo tail -50 /var/log/nginx/preinscription-error.log
```

## Solution automatique

Exécutez le script de correction :
```bash
chmod +x fix-https.sh
./fix-https.sh
```

## Vérification finale

Après avoir appliqué les corrections :

```bash
# Vérifier que nginx écoute sur le port 443
sudo ss -tlnp | grep nginx

# Vous devriez voir :
# LISTEN 0 511 0.0.0.0:443 0.0.0.0:* users:(("nginx",...))
# LISTEN 0 511 0.0.0.0:80 0.0.0.0:* users:(("nginx",...))

# Test local
curl -k -I https://localhost

# Test depuis l'extérieur
curl -I https://preinscription.sbcgroupe.ca
```

## Ordre d'exécution recommandé

1. `./diagnose-https.sh` - Identifier le problème
2. Installer/renouveler les certificats SSL si nécessaire
3. Ouvrir le pare-feu (ports 80 et 443)
4. `sudo nginx -t` - Vérifier la configuration
5. `sudo systemctl reload nginx` - Recharger
6. `sudo ss -tlnp | grep nginx` - Vérifier que le port 443 est ouvert

## Notes importantes

- Les certificats Let's Encrypt expirent après 90 jours, configurez le renouvellement automatique
- Si vous modifiez la configuration nginx, toujours faire `sudo nginx -t` avant de recharger
- Le pare-feu du serveur (UFW/iptables) ET le pare-feu du fournisseur d'hébergement doivent autoriser le port 443

