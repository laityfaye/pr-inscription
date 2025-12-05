#!/bin/bash

echo "=========================================="
echo "🔍 Diagnostic du serveur Nginx"
echo "=========================================="
echo ""

echo "1. Statut de Nginx"
echo "------------------------------------------"
sudo systemctl status nginx --no-pager | head -10
echo ""

echo "2. Test de la configuration Nginx"
echo "------------------------------------------"
sudo nginx -t
echo ""

echo "3. Ports ouverts par Nginx"
echo "------------------------------------------"
sudo netstat -tlnp 2>/dev/null | grep nginx || sudo ss -tlnp | grep nginx
echo ""

echo "4. Statut de PHP-FPM"
echo "------------------------------------------"
sudo systemctl status php8.2-fpm --no-pager | head -10
echo ""

echo "5. Socket PHP-FPM"
echo "------------------------------------------"
if [ -e /var/run/php/php8.2-fpm.sock ]; then
    ls -la /var/run/php/php8.2-fpm.sock
else
    echo "❌ Socket PHP-FPM non trouvé!"
fi
echo ""

echo "6. Configuration Nginx installée"
echo "------------------------------------------"
if [ -f /etc/nginx/sites-available/preinscription.sbcgroupe.ca ]; then
    echo "✅ Fichier config trouvé"
    ls -la /etc/nginx/sites-available/preinscription.sbcgroupe.ca
else
    echo "❌ Fichier config NON trouvé!"
fi
echo ""

if [ -L /etc/nginx/sites-enabled/preinscription.sbcgroupe.ca ]; then
    echo "✅ Lien symbolique trouvé"
    ls -la /etc/nginx/sites-enabled/preinscription.sbcgroupe.ca
else
    echo "❌ Lien symbolique NON trouvé!"
fi
echo ""

echo "7. Frontend buildé"
echo "------------------------------------------"
if [ -f /home/deploy/pr-inscription/frontend/dist/index.html ]; then
    echo "✅ Frontend buildé trouvé"
    ls -lh /home/deploy/pr-inscription/frontend/dist/index.html
    echo "Taille du dossier dist:"
    du -sh /home/deploy/pr-inscription/frontend/dist
else
    echo "❌ Frontend NON buildé! (dist/index.html non trouvé)"
fi
echo ""

echo "8. Backend Laravel"
echo "------------------------------------------"
if [ -f /home/deploy/pr-inscription/backend/public/index.php ]; then
    echo "✅ Backend Laravel trouvé"
    ls -lh /home/deploy/pr-inscription/backend/public/index.php
else
    echo "❌ Backend Laravel NON trouvé!"
fi
echo ""

echo "9. Storage Laravel"
echo "------------------------------------------"
if [ -L /home/deploy/pr-inscription/backend/public/storage ]; then
    echo "✅ Lien symbolique storage trouvé"
    ls -la /home/deploy/pr-inscription/backend/public/storage
else
    echo "❌ Lien symbolique storage NON trouvé!"
    echo "   Exécutez: cd /home/deploy/pr-inscription/backend && php artisan storage:link"
fi
echo ""

echo "10. Permissions"
echo "------------------------------------------"
echo "Propriétaire du dossier pr-inscription:"
ls -ld /home/deploy/pr-inscription
echo ""
echo "Permissions storage:"
ls -ld /home/deploy/pr-inscription/backend/storage
echo ""

echo "11. Test HTTP local"
echo "------------------------------------------"
curl -I http://localhost 2>&1 | head -5
echo ""

echo "12. Test API local"
echo "------------------------------------------"
curl -I http://localhost/api/agency 2>&1 | head -5
echo ""

echo "13. Dernières erreurs Nginx (10 dernières lignes)"
echo "------------------------------------------"
if [ -f /var/log/nginx/preinscription-error.log ]; then
    sudo tail -10 /var/log/nginx/preinscription-error.log
elif [ -f /var/log/nginx/error.log ]; then
    sudo tail -10 /var/log/nginx/error.log
else
    echo "Aucun log d'erreur trouvé"
fi
echo ""

echo "=========================================="
echo "✅ Diagnostic terminé"
echo "=========================================="

