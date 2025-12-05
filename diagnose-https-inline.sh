#!/bin/bash
# Copiez-collez ce script directement dans votre terminal serveur

echo "=========================================="
echo "🔍 Diagnostic HTTPS - Port 443"
echo "=========================================="
echo ""

echo "1. Vérification des ports ouverts (80 et 443)"
echo "------------------------------------------"
sudo ss -tlnp | grep -E ':(80|443)' | grep nginx
echo ""

echo "2. Test de la configuration Nginx"
echo "------------------------------------------"
sudo nginx -t
echo ""

echo "3. Vérification des certificats SSL"
echo "------------------------------------------"
if [ -f /etc/letsencrypt/live/preinscription.sbcgroupe.ca/fullchain.pem ]; then
    echo "✅ Certificat fullchain.pem existe"
    sudo ls -lh /etc/letsencrypt/live/preinscription.sbcgroupe.ca/fullchain.pem
else
    echo "❌ Certificat fullchain.pem MANQUANT!"
fi
echo ""

if [ -f /etc/letsencrypt/live/preinscription.sbcgroupe.ca/privkey.pem ]; then
    echo "✅ Clé privée privkey.pem existe"
    sudo ls -lh /etc/letsencrypt/live/preinscription.sbcgroupe.ca/privkey.pem
else
    echo "❌ Clé privée privkey.pem MANQUANT!"
fi
echo ""

if [ -f /etc/letsencrypt/options-ssl-nginx.conf ]; then
    echo "✅ options-ssl-nginx.conf existe"
else
    echo "❌ options-ssl-nginx.conf MANQUANT!"
fi
echo ""

if [ -f /etc/letsencrypt/ssl-dhparams.pem ]; then
    echo "✅ ssl-dhparams.pem existe"
else
    echo "❌ ssl-dhparams.pem MANQUANT!"
fi
echo ""

echo "4. Vérification du pare-feu (UFW)"
echo "------------------------------------------"
if command -v ufw &> /dev/null; then
    sudo ufw status | grep -E '(80|443|Status)'
else
    echo "UFW non installé, vérifiez iptables ou firewalld"
fi
echo ""

echo "5. Logs d'erreur Nginx (dernières 20 lignes)"
echo "------------------------------------------"
sudo tail -20 /var/log/nginx/error.log
echo ""

echo "6. Logs spécifiques au site (dernières 10 lignes)"
echo "------------------------------------------"
if [ -f /var/log/nginx/preinscription-error.log ]; then
    sudo tail -10 /var/log/nginx/preinscription-error.log
else
    echo "Fichier de log spécifique non trouvé"
fi
echo ""

echo "7. Statut de Nginx"
echo "------------------------------------------"
sudo systemctl status nginx --no-pager | head -15
echo ""

echo "8. Vérification de la configuration chargée"
echo "------------------------------------------"
sudo nginx -T 2>&1 | grep -A 5 "listen.*443" | head -10
echo ""

echo "=========================================="
echo "✅ Diagnostic terminé"
echo "=========================================="

