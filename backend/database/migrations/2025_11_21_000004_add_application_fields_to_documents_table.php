<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->foreignId('work_permit_application_id')->nullable()->after('inscription_id')->constrained('work_permit_applications')->onDelete('cascade');
            $table->foreignId('residence_application_id')->nullable()->after('work_permit_application_id')->constrained('residence_applications')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['work_permit_application_id']);
            $table->dropForeign(['residence_application_id']);
            $table->dropColumn(['work_permit_application_id', 'residence_application_id']);
        });
    }
};

