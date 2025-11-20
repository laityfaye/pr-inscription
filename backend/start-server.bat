@echo off
echo ========================================
echo Demarrage du serveur Laravel
echo ========================================
echo.
echo Le serveur sera accessible sur toutes les interfaces
echo URL locale: http://localhost:8000
echo URL reseau: http://10.31.117.128:8000
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo ========================================
echo.
php artisan serve --host=0.0.0.0 --port=8000

