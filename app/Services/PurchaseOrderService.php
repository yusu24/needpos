<?php

namespace App\Services;

use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseReceive;
use App\Models\PurchaseReceiveItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PurchaseOrderService
{
    protected StockService $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    /**
     * Generate unique PO number.
     */
    public function generatePoNumber(int $outletId): string
    {
        $dateStr = now()->format('Ymd');
        $prefix = "PO-{$dateStr}-";

        $lastPo = PurchaseOrder::where('outlet_id', $outletId)
            ->where('po_number', 'like', $prefix . '%')
            ->orderBy('id', 'desc')
            ->first();

        if ($lastPo) {
            $lastSeq = (int) substr($lastPo->po_number, -5);
            $nextSeq = str_pad($lastSeq + 1, 5, '0', STR_PAD_LEFT);
        } else {
            $nextSeq = '00001';
        }

        return $prefix . $nextSeq;
    }

    /**
     * Generate unique Receive number.
     */
    public function generateReceiveNumber(int $outletId): string
    {
        $dateStr = now()->format('Ymd');
        $prefix = "RCV-{$dateStr}-";

        $lastReceive = PurchaseReceive::where('outlet_id', $outletId)
            ->where('receive_number', 'like', $prefix . '%')
            ->orderBy('id', 'desc')
            ->first();

        if ($lastReceive) {
            $lastSeq = (int) substr($lastReceive->receive_number, -5);
            $nextSeq = str_pad($lastSeq + 1, 5, '0', STR_PAD_LEFT);
        } else {
            $nextSeq = '00001';
        }

        return $prefix . $nextSeq;
    }

    /**
     * Create a new Purchase Order.
     */
    public function create(array $data, User $user): PurchaseOrder
    {
        return DB::transaction(function () use ($data, $user) {
            $poNumber = $this->generatePoNumber($user->outlet_id);

            $po = PurchaseOrder::create([
                'outlet_id' => $user->outlet_id,
                'supplier_id' => $data['supplier_id'],
                'user_id' => $user->id,
                'po_number' => $poNumber,
                'status' => 'draft',
                'subtotal' => $data['subtotal'] ?? 0,
                'tax_amount' => $data['tax_amount'] ?? 0,
                'total_amount' => $data['total_amount'] ?? 0,
                'note' => $data['note'] ?? null,
                'expected_at' => $data['expected_at'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                PurchaseOrderItem::create([
                    'po_id' => $po->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'ordered_qty' => $item['ordered_qty'],
                    'received_qty' => 0,
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['ordered_qty'] * $item['unit_price'],
                ]);
            }

            return $po;
        });
    }

    /**
     * Receive goods from PO.
     */
    public function receiveGoods(PurchaseOrder $po, array $data, User $user): PurchaseReceive
    {
        return DB::transaction(function () use ($po, $data, $user) {
            // PO status check (status can only advance: draft -> sent -> partial/received -> cancelled)
            if (in_array($po->status, ['received', 'cancelled'])) {
                throw new \Exception("Cannot receive goods for PO with status: {$po->status}");
            }

            $receiveNumber = $this->generateReceiveNumber($user->outlet_id);

            $receive = PurchaseReceive::create([
                'outlet_id' => $user->outlet_id,
                'po_id' => $po->id,
                'user_id' => $user->id,
                'receive_number' => $receiveNumber,
                'note' => $data['note'] ?? null,
                'received_at' => now(),
            ]);

            foreach ($data['items'] as $item) {
                $poItem = PurchaseOrderItem::where('po_id', $po->id)
                    ->where('product_id', $item['product_id'])
                    ->first();

                if (!$poItem) {
                    continue;
                }

                $qtyReceived = (float) $item['qty_received'];
                if ($qtyReceived <= 0) {
                    continue;
                }

                $unitPrice = (float) ($item['unit_price'] ?? $poItem->unit_price);
                $subtotal = $qtyReceived * $unitPrice;

                // Log receive item
                PurchaseReceiveItem::create([
                    'receive_id' => $receive->id,
                    'po_item_id' => $poItem->id,
                    'product_id' => $poItem->product_id,
                    'qty_received' => $qtyReceived,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ]);

                // Update PO item received qty
                $poItem->received_qty += $qtyReceived;
                $poItem->save();

                // Increase stock
                $product = Product::findOrFail($poItem->product_id);
                $this->stockService->addStock(
                    $product,
                    $qtyReceived,
                    $user,
                    "Penerimaan barang PO #{$po->po_number} (Ref: {$receiveNumber})"
                );

                // Update cost price on product to last unit price
                $product->cost_price = $unitPrice;
                $product->save();
            }

            // Recalculate PO status
            $po->load('items');
            $allReceived = true;
            $anyReceived = false;

            foreach ($po->items as $item) {
                if ($item->received_qty < $item->ordered_qty) {
                    $allReceived = false;
                }
                if ($item->received_qty > 0) {
                    $anyReceived = true;
                }
            }

            if ($allReceived) {
                $po->status = 'received';
            } elseif ($anyReceived) {
                $po->status = 'partial';
            } else {
                $po->status = 'sent';
            }

            $po->save();

            return $receive;
        });
    }
}
