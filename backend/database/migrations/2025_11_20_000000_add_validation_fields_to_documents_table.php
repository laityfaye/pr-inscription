<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->after('size');
            $table->text('rejection_reason')->nullable()->after('status');
            $table->timestamp('validated_at')->nullable()->after('rejection_reason');
            $table->foreignId('validated_by')->nullable()->after('validated_at')->constrained('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['validated_by']);
            $table->dropColumn(['status', 'rejection_reason', 'validated_at', 'validated_by']);
        });
    }
};

