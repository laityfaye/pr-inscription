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
            // Index pour les requêtes de conversation (sender_id + receiver_id)
            $table->index(['sender_id', 'receiver_id'], 'messages_sender_receiver_index');
            // Index pour les requêtes de messages non lus
            $table->index(['receiver_id', 'is_read'], 'messages_receiver_read_index');
            // Index pour les requêtes par application
            $table->index(['inscription_id'], 'messages_inscription_index');
            $table->index(['work_permit_application_id'], 'messages_work_permit_index');
            $table->index(['residence_application_id'], 'messages_residence_index');
            // Index pour les requêtes par date (pour le tri)
            $table->index('created_at', 'messages_created_at_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex('messages_sender_receiver_index');
            $table->dropIndex('messages_receiver_read_index');
            $table->dropIndex('messages_inscription_index');
            $table->dropIndex('messages_work_permit_index');
            $table->dropIndex('messages_residence_index');
            $table->dropIndex('messages_created_at_index');
        });
    }
};
