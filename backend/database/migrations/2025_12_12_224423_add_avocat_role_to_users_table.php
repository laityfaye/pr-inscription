<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modifier l'enum pour ajouter 'avocat'
        // Note: MySQL/MariaDB nécessite une modification directe de l'enum
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'client', 'avocat') DEFAULT 'client'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Retirer 'avocat' de l'enum
        // Note: On ne peut pas simplement retirer une valeur d'un enum si elle est utilisée
        // Il faudrait d'abord migrer les utilisateurs avec le rôle 'avocat' vers un autre rôle
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'client') DEFAULT 'client'");
    }
};
