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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('screening_id')->constrained()->cascadeOnDelete();
            $table->string('reference', 12)->unique();
            $table->string('status');
            $table->unsignedInteger('total_pence');
            $table->timestampTz('held_until')->nullable();
            $table->timestampTz('confirmed_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'held_until']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
