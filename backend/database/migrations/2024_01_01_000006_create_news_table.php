<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('news', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Admin qui a créé
            $table->string('title');
            $table->text('content');
            $table->string('image')->nullable();
            $table->string('video_url')->nullable(); // YouTube URL ou fichier mp4
            $table->string('video_type')->nullable(); // youtube ou file
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('news');
    }
};














