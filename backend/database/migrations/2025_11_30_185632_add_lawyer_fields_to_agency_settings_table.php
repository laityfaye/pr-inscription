<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agency_settings', function (Blueprint $table) {
            $table->boolean('lawyer_card_enabled')->default(false)->after('registration_number');
            $table->string('lawyer_first_name')->nullable()->after('lawyer_card_enabled');
            $table->string('lawyer_last_name')->nullable()->after('lawyer_first_name');
            $table->string('lawyer_title')->nullable()->after('lawyer_last_name');
            $table->string('lawyer_image')->nullable()->after('lawyer_title');
            $table->string('lawyer_phone')->nullable()->after('lawyer_image');
            $table->string('lawyer_email')->nullable()->after('lawyer_phone');
        });
    }

    public function down(): void
    {
        Schema::table('agency_settings', function (Blueprint $table) {
            $table->dropColumn([
                'lawyer_card_enabled',
                'lawyer_first_name',
                'lawyer_last_name',
                'lawyer_title',
                'lawyer_image',
                'lawyer_phone',
                'lawyer_email',
            ]);
        });
    }
};
