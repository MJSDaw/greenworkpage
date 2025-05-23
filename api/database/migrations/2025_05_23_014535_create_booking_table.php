<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->enum('status', [
                'pending',
                'confirmed',
                'cancelled',
                'completed'
            ])->default('confirmed');
            $table->text('purpose')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Índices para mejorar el rendimiento de las consultas
            $table->index(['space_id', 'start_time', 'end_time']);
            $table->index(['user_id', 'start_time']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('bookings');
    }
};