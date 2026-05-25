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
            $table->foreignId('photo_session_id')->constrained('photo_sessions')->onDelete('cascade');
            $table->string('transaction_id')->unique()->nullable();
            $table->string('order_id')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('IDR');
            $table->string('payment_method')->nullable(); // credit_card, bank_transfer, e_wallet, etc
            $table->string('status')->default('pending'); // pending, processing, paid, failed, cancelled, expired
            $table->string('payment_type')->nullable();
            $table->json('midtrans_response')->nullable();
            $table->dateTime('paid_at')->nullable();
            $table->dateTime('expires_at')->nullable();
            $table->string('receipt_url')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
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
