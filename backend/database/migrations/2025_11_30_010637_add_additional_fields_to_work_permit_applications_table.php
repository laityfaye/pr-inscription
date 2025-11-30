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
            $table->integer('age')->nullable()->after('work_permit_country_id');
            $table->string('profession')->nullable()->after('age');
            $table->integer('experience_years')->nullable()->after('profession');
            $table->string('current_employer')->nullable()->after('experience_years');
            $table->string('phone_number')->nullable()->after('current_employer');
            $table->text('address')->nullable()->after('phone_number');
            $table->string('education_level')->nullable()->after('address');
            $table->text('language_skills')->nullable()->after('education_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_permit_applications', function (Blueprint $table) {
            $table->dropColumn([
                'age',
                'profession',
                'experience_years',
                'current_employer',
                'phone_number',
                'address',
                'education_level',
                'language_skills',
            ]);
        });
    }
};
