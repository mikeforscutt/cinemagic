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
        Schema::create('screenings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('film_id')->constrained()->cascadeOnDelete();
            $table->foreignId('screen_id')->constrained()->cascadeOnDelete();
            $table->timestampTz('starts_at');
            $table->unsignedInteger('base_price_pence');
            $table->timestamps();

            $table->index(['starts_at', 'film_id']);
            $table->unique(['screen_id', 'starts_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('screenings');
    }
};
