<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('outlet_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity', 10, 2)->default(0);
            $table->decimal('min_quantity', 10, 2)->default(5); // low stock threshold
            $table->timestamps();

            $table->unique(['product_id', 'outlet_id']);
            $table->index(['outlet_id', 'quantity']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock');
    }
};
