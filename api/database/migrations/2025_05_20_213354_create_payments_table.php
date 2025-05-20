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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Using a regular foreign key with the specific columns for reservation
            $table->unsignedBigInteger('user_reservation_id')->nullable();
            $table->unsignedBigInteger('space_reservation_id')->nullable();
            $table->string('reservation_period')->nullable();
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->string('payment_method', 50)->nullable();
            $table->timestamp('payment_date')->nullable();
            $table->timestamps();
            
            // Index for faster lookups
            $table->index(['user_id']);
            $table->index(['user_reservation_id', 'space_reservation_id', 'reservation_period']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
