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
            ['email' => 'massaersyll3@gmail.com'],
            [
                'name' => 'Administrateur',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '789553756',
            ]
        );

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

        // Créer un client de test
        // User::create([
        //     'name' => 'Client Test',
        //     'email' => 'client@test.com',
        //     'password' => Hash::make('password'),
        //     'role' => 'client',
        //     'phone' => '771801995',
        //     'target_country' => 'France',
        // ]);

        // Créer les pays
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
                'email' => 'massaersyll3@gmail.com',
                'whatsapp' => '789553756',
                'phone' => '789553756',
                'address' => 'Dakar, HLM FASS',
                'registration_number' => 'SN.DKR.2025.A.34574',
            ]
        );
    }
}


