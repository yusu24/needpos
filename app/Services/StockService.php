<?php
// app/Services/StockService.php

namespace App\Services;

use App\Events\StockLow;
use App\Models\Product;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class StockService
{
    /**
     * Kurangi stok produk setelah transaksi.
     * Harus dipanggil dalam DB::transaction().
     *
     * @throws \Exception jika stok tidak mencukupi
     */
    public function deduct(
        Product $product,
        float $quantity,
        string $referenceType,
        int $referenceId,
        User $user,
        string $note = ''
    ): void {
        // Produk service/non-track skip deduction
        if (! $product->track_stock) {
            return;
        }

        // Lock row untuk mencegah race condition
        $stock = Stock::where('product_id', $product->id)
            ->where('outlet_id', $product->outlet_id)
            ->lockForUpdate()
            ->first();

        if (! $stock) {
            throw new \Exception("Stok untuk produk [{$product->name}] tidak ditemukan.");
        }

        if ($stock->quantity < $quantity) {
            throw new \Exception(
                "Stok produk [{$product->name}] tidak mencukupi. " .
                "Tersedia: {$stock->quantity}, dibutuhkan: {$quantity}."
            );
        }

        $quantityBefore = $stock->quantity;
        $stock->quantity -= $quantity;
        $stock->save();

        // Log movement
        StockMovement::create([
            'product_id'       => $product->id,
            'outlet_id'        => $product->outlet_id,
            'type'             => 'out',
            'quantity'         => -$quantity,
            'quantity_before'  => $quantityBefore,
            'quantity_after'   => $stock->quantity,
            'reference_type'   => $referenceType,
            'reference_id'     => $referenceId,
            'note'             => $note ?: "Penjualan #{$referenceId}",
            'user_id'          => $user->id,
            'created_at'       => now(),
        ]);

        // Broadcast low stock alert jika stok di bawah threshold
        if ($stock->isLow()) {
            broadcast(new StockLow($product, $stock));
        }
    }

    /**
     * Kembalikan stok setelah void transaksi.
     * Harus dipanggil dalam DB::transaction().
     */
    public function restore(
        Product $product,
        float $quantity,
        string $referenceType,
        int $referenceId,
        User $user,
        string $note = ''
    ): void {
        if (! $product->track_stock) {
            return;
        }

        $stock = Stock::where('product_id', $product->id)
            ->where('outlet_id', $product->outlet_id)
            ->lockForUpdate()
            ->first();

        if (! $stock) {
            // Buat record stok baru jika belum ada (edge case)
            $stock = Stock::create([
                'product_id'   => $product->id,
                'outlet_id'    => $product->outlet_id,
                'quantity'     => 0,
                'min_quantity' => 5,
            ]);
        }

        $quantityBefore = $stock->quantity;
        $stock->quantity += $quantity;
        $stock->save();

        StockMovement::create([
            'product_id'      => $product->id,
            'outlet_id'       => $product->outlet_id,
            'type'            => 'void',
            'quantity'        => $quantity,
            'quantity_before' => $quantityBefore,
            'quantity_after'  => $stock->quantity,
            'reference_type'  => $referenceType,
            'reference_id'    => $referenceId,
            'note'            => $note ?: "Void order #{$referenceId}",
            'user_id'         => $user->id,
            'created_at'      => now(),
        ]);
    }

    /**
     * Tambah stok manual (restock).
     */
    public function addStock(
        Product $product,
        float $quantity,
        User $user,
        string $note = ''
    ): Stock {
        return DB::transaction(function () use ($product, $quantity, $user, $note) {
            $stock = Stock::where('product_id', $product->id)
                ->where('outlet_id', $product->outlet_id)
                ->lockForUpdate()
                ->firstOrCreate(
                    ['product_id' => $product->id, 'outlet_id' => $product->outlet_id],
                    ['quantity' => 0, 'min_quantity' => 5]
                );

            $quantityBefore = $stock->quantity;
            $stock->quantity += $quantity;
            $stock->save();

            StockMovement::create([
                'product_id'      => $product->id,
                'outlet_id'       => $product->outlet_id,
                'type'            => 'in',
                'quantity'        => $quantity,
                'quantity_before' => $quantityBefore,
                'quantity_after'  => $stock->quantity,
                'note'            => $note ?: "Restock manual",
                'user_id'         => $user->id,
                'created_at'      => now(),
            ]);

            return $stock->fresh();
        });
    }

    /**
     * Penyesuaian stok (stock opname).
     */
    public function adjustStock(
        Product $product,
        float $newQuantity,
        User $user,
        string $note = ''
    ): Stock {
        return DB::transaction(function () use ($product, $newQuantity, $user, $note) {
            $stock = Stock::where('product_id', $product->id)
                ->where('outlet_id', $product->outlet_id)
                ->lockForUpdate()
                ->firstOrCreate(
                    ['product_id' => $product->id, 'outlet_id' => $product->outlet_id],
                    ['quantity' => 0, 'min_quantity' => 5]
                );

            $quantityBefore = $stock->quantity;
            $stock->quantity = $newQuantity;
            $stock->save();

            StockMovement::create([
                'product_id'      => $product->id,
                'outlet_id'       => $product->outlet_id,
                'type'            => 'adjustment',
                'quantity'        => $newQuantity - $quantityBefore,
                'quantity_before' => $quantityBefore,
                'quantity_after'  => $stock->quantity,
                'note'            => $note ?: "Stock opname / penyesuaian",
                'user_id'         => $user->id,
                'created_at'      => now(),
            ]);

            return $stock->fresh();
        });
    }

    /**
     * Kurangi stok untuk retur ke supplier.
     */
    public function supplierReturn(
        Product $product,
        float $quantity,
        User $user,
        string $note = ''
    ): void {
        if (! $product->track_stock) {
            return;
        }

        DB::transaction(function () use ($product, $quantity, $user, $note) {
            $stock = Stock::where('product_id', $product->id)
                ->where('outlet_id', $product->outlet_id)
                ->lockForUpdate()
                ->first();

            if (! $stock) {
                throw new \Exception("Stok untuk produk [{$product->name}] tidak ditemukan.");
            }

            if ($stock->quantity < $quantity) {
                throw new \Exception(
                    "Stok produk [{$product->name}] tidak mencukupi untuk diretur. " .
                    "Tersedia: {$stock->quantity}, akan diretur: {$quantity}."
                );
            }

            $quantityBefore = $stock->quantity;
            $stock->quantity -= $quantity;
            $stock->save();

            StockMovement::create([
                'product_id'       => $product->id,
                'outlet_id'        => $product->outlet_id,
                'type'             => 'return_supplier',
                'quantity'         => -$quantity,
                'quantity_before'  => $quantityBefore,
                'quantity_after'   => $stock->quantity,
                'note'             => $note ?: "Retur ke supplier",
                'user_id'          => $user->id,
                'created_at'       => now(),
            ]);
        });
    }

    /**
     * Tambah stok untuk retur dari pelanggan.
     */
    public function customerReturn(
        Product $product,
        float $quantity,
        User $user,
        string $note = ''
    ): void {
        if (! $product->track_stock) {
            return;
        }

        DB::transaction(function () use ($product, $quantity, $user, $note) {
            $stock = Stock::where('product_id', $product->id)
                ->where('outlet_id', $product->outlet_id)
                ->lockForUpdate()
                ->firstOrCreate(
                    ['product_id' => $product->id, 'outlet_id' => $product->outlet_id],
                    ['quantity' => 0, 'min_quantity' => 5]
                );

            $quantityBefore = $stock->quantity;
            $stock->quantity += $quantity;
            $stock->save();

            StockMovement::create([
                'product_id'       => $product->id,
                'outlet_id'        => $product->outlet_id,
                'type'             => 'return_customer',
                'quantity'         => $quantity,
                'quantity_before'  => $quantityBefore,
                'quantity_after'   => $stock->quantity,
                'note'             => $note ?: "Retur dari pelanggan",
                'user_id'          => $user->id,
                'created_at'       => now(),
            ]);
        });
    }
}

