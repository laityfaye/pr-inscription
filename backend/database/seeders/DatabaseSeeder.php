<?php

namespace Database\Seeders;

use App\Models\AgencySetting;
use App\Models\Country;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Créer ou mettre à jour l'admin
        User::updateOrCreate(
<<<<<<< HEAD
            ['email' => 'toubafallv@gmail.com'],
=======
            ['email' => 'massaersyll3@gmail.com'],
>>>>>>> 3a0395d1eb49ba2910224bbb5ceb189e441e3817
            [
                'name' => 'Administrateur',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '789553756',
            ]
        );
<<<<<<< HEAD
=======

        // Créer ou mettre à jour l'avocat
        User::updateOrCreate(
            ['email' => 'sbcvoyage110@gmail.com'],
            [
                'name' => 'Avocat',
                'password' => Hash::make('sbcgroupe#123@'),
                'role' => 'avocat',
                'phone' => null,
            ]
        );
>>>>>>> 3a0395d1eb49ba2910224bbb5ceb189e441e3817

        // Créer ou mettre à jour les pays
        $countries = [
            ['name' => 'Canada', 'code' => 'CAN', 'description' => 'Étudiez au Canada'],
            ['name' => 'France', 'code' => 'FRA', 'description' => 'Étudiez en France'],
            ['name' => 'Belgique', 'code' => 'BEL', 'description' => 'Étudiez en Belgique'],
            ['name' => 'Luxembourg', 'code' => 'LUX', 'description' => 'Étudiez au Luxembourg'],
        ];

        foreach ($countries as $country) {
            Country::updateOrCreate(
                ['code' => $country['code']],
                $country
            );
        }

        // Créer ou mettre à jour les paramètres de l'agence
        AgencySetting::updateOrCreate(
            ['name' => 'InnoSoft'],
            [
                'description' => 'Votre destination, notre mission. Nous vous accompagnons dans vos démarches de préinscription pour vos études à l\'étranger.',
<<<<<<< HEAD
                'email' => 'laityfaye@gmail.com',
                'whatsapp' => '780186229',
                'phone' => '780186229',
=======
                'email' => 'massaersyll3@gmail.com',
                'whatsapp' => '789553756',
                'phone' => '789553756',
>>>>>>> 3a0395d1eb49ba2910224bbb5ceb189e441e3817
                'address' => 'Dakar, HLM FASS',
                'registration_number' => 'SN.DKR.2025.A.34574',
            ]
        );
    }
}


