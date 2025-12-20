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
        $driver = DB::getDriverName();
        
        if ($driver === 'pgsql') {
            // PostgreSQL : trouver et supprimer toutes les contraintes CHECK liées à la colonne role
            $constraints = DB::select("
                SELECT constraint_name 
                FROM information_schema.table_constraints 
                WHERE table_name = 'users' 
                AND constraint_type = 'CHECK'
                AND constraint_name IN (
                    SELECT constraint_name 
                    FROM information_schema.constraint_column_usage 
                    WHERE table_name = 'users' 
                    AND column_name = 'role'
                )
            ");
            
            foreach ($constraints as $constraint) {
                DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS {$constraint->constraint_name}");
            }
            
            // Créer la nouvelle contrainte avec 'avocat' ajouté
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'client', 'avocat'))");
        } elseif ($driver === 'mysql' || $driver === 'mariadb') {
            // MySQL/MariaDB : modifier directement l'enum
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'client', 'avocat') DEFAULT 'client'");
        } else {
            // Pour les autres SGBD, utiliser Schema
            Schema::table('users', function (Blueprint $table) {
                $table->enum('role', ['admin', 'client', 'avocat'])->default('client')->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();
        
        if ($driver === 'pgsql') {
            // PostgreSQL : restaurer l'ancienne contrainte
            // Note: Il faudrait d'abord migrer les utilisateurs avec le rôle 'avocat' vers un autre rôle
            $constraints = DB::select("
                SELECT constraint_name 
                FROM information_schema.table_constraints 
                WHERE table_name = 'users' 
                AND constraint_type = 'CHECK'
                AND constraint_name IN (
                    SELECT constraint_name 
                    FROM information_schema.constraint_column_usage 
                    WHERE table_name = 'users' 
                    AND column_name = 'role'
                )
            ");
            
            foreach ($constraints as $constraint) {
                DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS {$constraint->constraint_name}");
            }
            
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'client'))");
        } elseif ($driver === 'mysql' || $driver === 'mariadb') {
            // MySQL/MariaDB : restaurer l'ancien enum
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'client') DEFAULT 'client'");
        } else {
            // Pour les autres SGBD
            Schema::table('users', function (Blueprint $table) {
                $table->enum('role', ['admin', 'client'])->default('client')->change();
            });
        }
    }
};
