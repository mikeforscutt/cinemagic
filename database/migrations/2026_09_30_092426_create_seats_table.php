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
        Schema::create('seats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('screen_id')->constrained()->cascadeOnDelete();
            $table->string('row_label', 2);
            $table->unsignedSmallInteger('seat_number');
            $table->string('type')->default('standard');
            $table->unsignedSmallInteger('position_x');
            $table->unsignedSmallInteger('position_y');
            $table->timestamps();

            $table->unique(['screen_id', 'row_label', 'seat_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seats');
    }
};
