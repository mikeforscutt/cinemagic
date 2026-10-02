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
        Schema::create('films', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('synopsis');
            $table->unsignedSmallInteger('runtime_minutes');
            $table->string('certificate', 5);           // U, PG, 12A, 15, 18
            $table->date('release_date');
            $table->string('director')->nullable();
            $table->json('genres');
            $table->json('cast_list')->nullable();
            $table->string('poster_path')->nullable();
            $table->timestamps();

            $table->index('release_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('films');
    }
};
