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
        Schema::table('work_permit_applications', function (Blueprint $table) {
            $table->enum('visa_type', ['visitor_visa', 'work_permit'])->default('work_permit')->after('work_permit_country_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_permit_applications', function (Blueprint $table) {
            $table->dropColumn('visa_type');
        });
    }
};
