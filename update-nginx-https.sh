#!/bin/bash
# Script pour mettre à jour la configuration nginx avec HTTPS

echo "=========================================="
echo "🔧 Mise à jour de la configuration Nginx HTTPS"
echo "=========================================="
echo ""

# Sauvegarder la configuration actuelle
echo "1. Sauvegarde de la configuration actuelle..."
sudo cp /etc/nginx/sites-available/preinscription /etc/nginx/sites-available/preinscription.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Sauvegarde créée"
echo ""

# Afficher la configuration actuelle
echo "2. Configuration actuelle (premières 20 lignes):"
echo "------------------------------------------"
sudo head -20 /etc/nginx/sites-available/preinscription
echo ""

# Vérifier si le bloc HTTPS existe
if sudo grep -q "listen.*443" /etc/nginx/sites-available/preinscription; then
    echo "⚠️  Le bloc HTTPS existe déjà dans la configuration"
    echo "   Vérifiez pourquoi nginx ne l'utilise pas"
else
    echo "❌ Le bloc HTTPS n'existe PAS dans la configuration"
    echo ""
    echo "📝 Vous devez ajouter le bloc HTTPS manuellement"
    echo ""
    echo "Éditez le fichier avec:"
    echo "   sudo nano /etc/nginx/sites-available/preinscription"
    echo ""
    echo "Assurez-vous qu'il contient:"
    echo "   1. Un bloc server pour le port 80 (redirection HTTPS)"
    echo "   2. Un bloc server pour le port 443 (HTTPS avec SSL)"
fi
echo ""

echo "3. Après modification, exécutez:"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo "   sudo ss -tlnp | grep nginx"
echo ""

