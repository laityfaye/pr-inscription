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
            'email' => 'admin@tfks.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '789553756',
        ]);

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
            Country::create($country);
        }

        // Créer les paramètres de l'agence
        AgencySetting::create([
            'name' => 'TFKS Touba Fall Khidma Services',
            'description' => 'Votre destination, notre mission. Nous vous accompagnons dans vos démarches de préinscription pour vos études à l\'étranger.',
            'email' => 'toubafallv@gmail.com',
            'whatsapp' => '789553756',
            'phone' => '789553756 - 771801995',
            'address' => 'Dakar, HLM FASS',
            'registration_number' => 'SN.DKR.2025.A.34574',
        ]);
    }
}


