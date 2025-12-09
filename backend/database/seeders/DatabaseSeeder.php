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
        // Créer l'admin
        User::create([
            'name' => 'Administrateur',
            'email' => 'toubafallv@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '789553756',
        ]);

        // Créer les pays
        $countries = [
            ['name' => 'Canada', 'code' => 'CAN', 'description' => 'Étudiez au Canada'],
            ['name' => 'France', 'code' => 'FRA', 'description' => 'Étudiez en France'],
            ['name' => 'Belgique', 'code' => 'BEL', 'description' => 'Étudiez en Belgique'],
            ['name' => 'Luxembourg', 'code' => 'LUX', 'description' => 'Étudiez au Luxembourg'],
        ];

        foreach ($countries as $country) {
            Country::create($country);
        }

        // Créer les paramètres de l'agence
        AgencySetting::create([
            'name' => 'InnoSoft',
            'description' => 'Votre destination, notre mission. Nous vous accompagnons dans vos démarches de préinscription pour vos études à l\'étranger.',
            'email' => 'laityfaye@gmail.com',
            'whatsapp' => '780186229',
            'phone' => '780186229',
            'address' => 'Dakar, HLM FASS',
            'registration_number' => 'SN.DKR.2025.A.34574',
        ]);
    }
}


