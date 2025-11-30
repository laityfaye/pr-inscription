<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_permit_countries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('subtitle')->nullable();
            $table->string('code', 3)->nullable();
            $table->string('flag')->nullable();
            $table->text('description')->nullable();
            $table->text('eligibility_conditions')->nullable();
            $table->text('required_documents')->nullable();
            $table->text('application_process')->nullable();
            $table->text('processing_time')->nullable();
            $table->text('costs')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_permit_countries');
    }
};

