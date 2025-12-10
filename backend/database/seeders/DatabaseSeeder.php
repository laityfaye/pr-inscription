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
            ['email' => 'toubafallv@gmail.com'],
            [
                'name' => 'Administrateur',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '789553756',
            ]
        );

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
                'email' => 'laityfaye@gmail.com',
                'whatsapp' => '780186229',
                'phone' => '780186229',
                'address' => 'Dakar, HLM FASS',
                'registration_number' => 'SN.DKR.2025.A.34574',
            ]
        );
    }
}


