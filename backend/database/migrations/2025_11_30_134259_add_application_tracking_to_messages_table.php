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
        Schema::table('messages', function (Blueprint $table) {
            $table->enum('application_type', ['inscription', 'work_permit', 'residence'])->nullable()->after('content');
            $table->foreignId('inscription_id')->nullable()->constrained('inscriptions')->onDelete('cascade')->after('application_type');
            $table->foreignId('work_permit_application_id')->nullable()->constrained('work_permit_applications')->onDelete('cascade')->after('inscription_id');
            $table->foreignId('residence_application_id')->nullable()->constrained('residence_applications')->onDelete('cascade')->after('work_permit_application_id');
            $table->string('status_update')->nullable()->after('residence_application_id');
            $table->string('file_path')->nullable()->after('status_update');
            $table->string('file_name')->nullable()->after('file_path');
            $table->string('file_type')->nullable()->after('file_name');
            $table->unsignedBigInteger('file_size')->nullable()->after('file_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['inscription_id']);
            $table->dropForeign(['work_permit_application_id']);
            $table->dropForeign(['residence_application_id']);
            $table->dropColumn([
                'application_type',
                'inscription_id',
                'work_permit_application_id',
                'residence_application_id',
                'status_update',
                'file_path',
                'file_name',
                'file_type',
                'file_size',
            ]);
        });
    }
};
