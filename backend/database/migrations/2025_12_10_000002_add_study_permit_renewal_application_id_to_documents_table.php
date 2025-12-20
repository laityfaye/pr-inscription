<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->foreignId('study_permit_renewal_application_id')->nullable()->after('residence_application_id')->constrained('study_permit_renewal_applications')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['study_permit_renewal_application_id']);
            $table->dropColumn(['study_permit_renewal_application_id']);
        });
    }
};

