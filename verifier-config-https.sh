#!/bin/bash
# Script pour vérifier pourquoi le port 443 ne démarre pas

echo "=========================================="
echo "🔍 Vérification configuration HTTPS"
echo "=========================================="
echo ""

echo "1. Vérifier si le bloc HTTPS existe dans la config"
echo "------------------------------------------"
if sudo grep -q "listen.*443" /etc/nginx/sites-available/preinscription; then
    echo "✅ Le bloc 'listen 443' existe"
    sudo grep -A 2 "listen.*443" /etc/nginx/sites-available/preinscription
else
    echo "❌ Le bloc 'listen 443' N'EXISTE PAS!"
fi
echo ""

echo "2. Vérifier les certificats SSL dans la config"
echo "------------------------------------------"
if sudo grep -q "ssl_certificate" /etc/nginx/sites-available/preinscription; then
    echo "✅ ssl_certificate trouvé"
    sudo grep "ssl_certificate" /etc/nginx/sites-available/preinscription
else
    echo "❌ ssl_certificate N'EXISTE PAS dans la config!"
fi
echo ""

echo "3. Vérifier les fichiers SSL requis"
echo "------------------------------------------"
if [ -f /etc/letsencrypt/options-ssl-nginx.conf ]; then
    echo "✅ options-ssl-nginx.conf existe"
else
    echo "❌ options-ssl-nginx.conf MANQUANT!"
fi

if [ -f /etc/letsencrypt/ssl-dhparams.pem ]; then
    echo "✅ ssl-dhparams.pem existe"
else
    echo "❌ ssl-dhparams.pem MANQUANT!"
    echo "   Créez-le avec: sudo openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048"
fi
echo ""

echo "4. Logs d'erreur nginx (dernières 30 lignes)"
echo "------------------------------------------"
sudo tail -30 /var/log/nginx/error.log | grep -i -E "(ssl|443|certificate|error)" || sudo tail -30 /var/log/nginx/error.log
echo ""

echo "5. Configuration complète chargée (bloc serveur 443)"
echo "------------------------------------------"
sudo nginx -T 2>&1 | grep -A 30 "listen.*443" | head -40
echo ""

echo "6. Vérifier les permissions des certificats"
echo "------------------------------------------"
sudo ls -la /etc/letsencrypt/live/preinscription.sbcgroupe.ca/*.pem
echo ""

