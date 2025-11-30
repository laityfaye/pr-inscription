<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('residence_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['pending', 'in_progress', 'approved', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('client_notified_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            // Informations spécifiques pour la résidence au Canada
            $table->string('current_residence_country')->nullable();
            $table->string('residence_type')->nullable(); // permanent, temporary, etc.
            $table->text('family_members')->nullable(); // JSON pour les membres de la famille
            $table->text('employment_status')->nullable();
            $table->text('financial_situation')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('residence_applications');
    }
};

