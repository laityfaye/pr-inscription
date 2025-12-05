#!/bin/bash

echo "=========================================="
echo "🔧 Correction automatique HTTPS"
echo "=========================================="
echo ""

# 1. Vérifier et créer les certificats SSL si manquants
echo "1. Vérification des certificats SSL..."
if [ ! -f /etc/letsencrypt/live/preinscription.sbcgroupe.ca/fullchain.pem ]; then
    echo "⚠️  Certificats SSL manquants!"
    echo "   Exécutez: sudo certbot certonly --nginx -d preinscription.sbcgroupe.ca"
    echo ""
else
    echo "✅ Certificats SSL trouvés"
fi

# 2. Vérifier et ouvrir le pare-feu
echo "2. Vérification du pare-feu..."
if command -v ufw &> /dev/null; then
    if sudo ufw status | grep -q "Status: active"; then
        echo "   Ouverture des ports 80 et 443..."
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
        echo "✅ Ports ouverts"
    else
        echo "   UFW est inactif"
    fi
else
    echo "   UFW non installé, vérifiez iptables manuellement"
fi
echo ""

# 3. Vérifier la configuration nginx
echo "3. Test de la configuration Nginx..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Configuration valide"
    
    # Recharger nginx
    echo "   Rechargement de Nginx..."
    sudo systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx rechargé"
    else
        echo "❌ Erreur lors du rechargement, redémarrage..."
        sudo systemctl restart nginx
    fi
else
    echo "❌ Configuration invalide!"
    echo "   Vérifiez les erreurs ci-dessus"
    sudo nginx -t
    exit 1
fi
echo ""

# 4. Vérifier que nginx écoute sur le port 443
echo "4. Vérification du port 443..."
sleep 2
if sudo ss -tlnp | grep -q ":443.*nginx"; then
    echo "✅ Nginx écoute sur le port 443"
else
    echo "❌ Nginx n'écoute PAS sur le port 443"
    echo ""
    echo "   Causes possibles:"
    echo "   - Certificats SSL manquants ou invalides"
    echo "   - Erreur dans la configuration nginx"
    echo "   - Pare-feu bloque le port 443"
    echo ""
    echo "   Vérifiez les logs: sudo tail -50 /var/log/nginx/error.log"
fi
echo ""

echo "=========================================="
echo "✅ Correction terminée"
echo "=========================================="

