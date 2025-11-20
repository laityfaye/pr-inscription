<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('inscriptions', function (Blueprint $table) {
            $table->enum('current_education_level', ['bac', 'licence_1', 'licence_2', 'licence_3', 'master_1', 'master_2'])->nullable()->after('country_id');
            $table->string('current_field')->nullable()->after('current_education_level');
            $table->enum('requested_education_level', ['bac', 'licence_1', 'licence_2', 'licence_3', 'master_1', 'master_2'])->nullable()->after('current_field');
            $table->string('requested_field')->nullable()->after('requested_education_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inscriptions', function (Blueprint $table) {
            $table->dropColumn(['current_education_level', 'current_field', 'requested_education_level', 'requested_field']);
        });
    }
};
