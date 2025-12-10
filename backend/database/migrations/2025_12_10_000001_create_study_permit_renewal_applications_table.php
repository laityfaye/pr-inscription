<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_permit_renewal_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['pending', 'in_progress', 'approved', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('client_notified_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            // Informations spécifiques pour le renouvellement CAQ/Permis d'études
            $table->date('arrival_date')->nullable(); // Date d'arrivée au Canada
            $table->string('institution_name')->nullable(); // Nom de l'établissement
            $table->date('expiration_date')->nullable(); // Date d'expiration
            $table->string('address')->nullable(); // Adresse domicile
            $table->string('address_number')->nullable(); // Numéro d'adresse
            $table->string('country')->default('Canada'); // Par défaut Canada
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_permit_renewal_applications');
    }
};

