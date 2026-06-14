<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outlet_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete(); // kasir
            $table->string('order_number', 30)->unique(); // TRX-20250611-00042
            $table->enum('status', ['pending', 'paid', 'voided'])->default('pending');
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->enum('payment_method', ['cash', 'qris', 'card', 'transfer'])->nullable();
            $table->decimal('payment_amount', 15, 2)->default(0); // nominal dibayar
            $table->decimal('change_amount', 15, 2)->default(0);  // kembalian
            $table->foreignId('discount_id')->nullable()->constrained()->nullOnDelete();
            $table->text('note')->nullable();
            $table->timestamp('voided_at')->nullable();
            $table->foreignId('voided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('void_reason')->nullable();
            $table->timestamps();

            $table->index(['outlet_id', 'status', 'created_at']);
            $table->index(['outlet_id', 'user_id', 'created_at']);
            $table->index(['outlet_id', 'order_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
