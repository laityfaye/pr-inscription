#!/bin/bash
# Script pour mettre à jour la configuration API nginx sur le serveur

echo "=========================================="
echo "🔧 Mise à jour de la configuration API Nginx"
echo "=========================================="
echo ""

# Sauvegarder
echo "1. Sauvegarde de la configuration..."
sudo cp /etc/nginx/sites-available/preinscription /etc/nginx/sites-available/preinscription.backup.api.$(date +%Y%m%d_%H%M%S)
echo "✅ Sauvegarde créée"
echo ""

# Afficher la section API actuelle
echo "2. Configuration API actuelle:"
echo "------------------------------------------"
sudo sed -n '/# API Laravel/,/# PHP FPM/p' /etc/nginx/sites-available/preinscription
echo ""

echo "3. Pour corriger, éditez le fichier:"
echo "   sudo nano /etc/nginx/sites-available/preinscription"
echo ""
echo "   Remplacez la section API (lignes ~73-122) par la configuration"
echo "   dans le fichier CORRECTION-API-NGINX.md"
echo ""

