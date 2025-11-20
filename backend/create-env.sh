#!/bin/bash

# Script pour créer le fichier .env à partir de .env.example

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Fichier .env créé avec succès !"
    echo "⚠️  N'oubliez pas de :"
    echo "   1. Générer la clé d'application : php artisan key:generate"
    echo "   2. Configurer votre base de données PostgreSQL"
    echo "   3. Configurer votre mot de passe email SMTP"
else
    echo "⚠️  Le fichier .env existe déjà."
fi














