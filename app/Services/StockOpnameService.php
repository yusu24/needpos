<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Stock;
use App\Models\StockOpname;
use App\Models\StockOpnameItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class StockOpnameService
{
    protected StockService $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    /**
     * Start a new stock opname.
     */
    public function start(array $data, User $user): StockOpname
    {
        return DB::transaction(function () use ($data, $user) {
            // Rule 17: Hanya satu opname yang boleh berstatus draft per outlet pada satu waktu
            $existingDraft = StockOpname::where('outlet_id', $user->outlet_id)
                ->where('status', 'draft')
                ->exists();

            if ($existingDraft) {
                throw new \Exception("Ada sesi stock opname yang masih berstatus DRAFT di outlet ini. Harap finalisasi terlebih dahulu.");
            }

            $opname = StockOpname::create([
                'outlet_id' => $user->outlet_id,
                'status' => 'draft',
                'note' => $data['note'] ?? null,
                'user_id' => $user->id,
            ]);

            // Load all active products with track_stock enabled
            $products = Product::where('outlet_id', $user->outlet_id)
                ->where('track_stock', true)
                ->where('is_active', true)
                ->with('stock')
                ->get();

            foreach ($products as $product) {
                $systemQty = $product->stock?->quantity ?? 0.0;
                StockOpnameItem::create([
                    'opname_id' => $opname->id,
                    'product_id' => $product->id,
                    'system_qty' => $systemQty,
                    'physical_qty' => $systemQty, // default to system_qty initially
                    'difference' => 0.0,
                ]);
            }

            return $opname;
        });
    }

    /**
     * Finalize the stock opname.
     */
    public function finalize(StockOpname $opname, array $itemsData, User $user): StockOpname
    {
        return DB::transaction(function () use ($opname, $itemsData, $user) {
            // Rule 19: Opname yang sudah finalized tidak dapat diedit atau dibatalkan.
            if ($opname->status === 'finalized') {
                throw new \Exception("Sesi stock opname ini sudah difinalisasi.");
            }

            // Check if there's any other draft opname that's being finalized (to prevent race conditions)
            $opname = StockOpname::where('id', $opname->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($opname->status === 'finalized') {
                throw new \Exception("Sesi stock opname ini sudah difinalisasi oleh pengguna lain.");
            }

            $opname->status = 'finalized';
            $opname->finalized_at = now();
            $opname->save();

            // Save items & adjust stock
            foreach ($itemsData as $itemData) {
                $opnameItem = StockOpnameItem::where('opname_id', $opname->id)
                    ->where('product_id', $itemData['product_id'])
                    ->first();

                if (!$opnameItem) {
                    continue;
                }

                $physicalQty = (float) $itemData['physical_qty'];
                $difference = $physicalQty - $opnameItem->system_qty;

                $opnameItem->physical_qty = $physicalQty;
                $opnameItem->difference = $difference;
                $opnameItem->save();

                // If there's a difference, adjust stock
                if (abs($difference) > 0.0001) {
                    $product = Product::findOrFail($opnameItem->product_id);
                    $this->stockService->adjustStock(
                        $product,
                        $physicalQty,
                        $user,
                        "Stock Opname #{$opname->id} (Selisih: " . ($difference > 0 ? "+{$difference}" : $difference) . ")"
                    );
                }
            }

            return $opname;
        });
    }
}
