<?php

namespace App\Services;

use App\Models\CustomerReturn;
use App\Models\CustomerReturnItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\SupplierReturn;
use App\Models\SupplierReturnItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReturnService
{
    protected StockService $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    /**
     * Generate unique Supplier Return number.
     */
    public function generateSupplierReturnNumber(int $outletId): string
    {
        $dateStr = now()->format('Ymd');
        $prefix = "SRT-{$dateStr}-";

        $lastReturn = SupplierReturn::where('outlet_id', $outletId)
            ->where('return_number', 'like', $prefix . '%')
            ->orderBy('id', 'desc')
            ->first();

        if ($lastReturn) {
            $lastSeq = (int) substr($lastReturn->return_number, -5);
            $nextSeq = str_pad($lastSeq + 1, 5, '0', STR_PAD_LEFT);
        } else {
            $nextSeq = '00001';
        }

        return $prefix . $nextSeq;
    }

    /**
     * Generate unique Customer Return number.
     */
    public function generateCustomerReturnNumber(int $outletId): string
    {
        $dateStr = now()->format('Ymd');
        $prefix = "CRT-{$dateStr}-";

        $lastReturn = CustomerReturn::where('outlet_id', $outletId)
            ->where('return_number', 'like', $prefix . '%')
            ->orderBy('id', 'desc')
            ->first();

        if ($lastReturn) {
            $lastSeq = (int) substr($lastReturn->return_number, -5);
            $nextSeq = str_pad($lastSeq + 1, 5, '0', STR_PAD_LEFT);
        } else {
            $nextSeq = '00001';
        }

        return $prefix . $nextSeq;
    }

    /**
     * Create Supplier Return.
     */
    public function createSupplierReturn(array $data, User $user): SupplierReturn
    {
        return DB::transaction(function () use ($data, $user) {
            $returnNumber = $this->generateSupplierReturnNumber($user->outlet_id);

            $sr = SupplierReturn::create([
                'outlet_id' => $user->outlet_id,
                'supplier_id' => $data['supplier_id'],
                'user_id' => $user->id,
                'return_number' => $returnNumber,
                'reason' => $data['reason'] ?? null,
                'status' => 'draft',
                'total_amount' => $data['total_amount'] ?? 0,
                'note' => $data['note'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                SupplierReturnItem::create([
                    'return_id' => $sr->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                ]);
            }

            return $sr;
        });
    }

    /**
     * Confirm Supplier Return (Deducts stock).
     */
    public function confirmSupplierReturn(SupplierReturn $sr, User $user): SupplierReturn
    {
        return DB::transaction(function () use ($sr, $user) {
            if ($sr->status === 'confirmed') {
                throw new \Exception("Retur ke supplier ini sudah dikonfirmasi.");
            }

            $sr->status = 'confirmed';
            $sr->save();

            $sr->load('items.product');

            foreach ($sr->items as $item) {
                $this->stockService->supplierReturn(
                    $item->product,
                    (float) $item->quantity,
                    $user,
                    "Retur supplier #{$sr->return_number}"
                );
            }

            return $sr;
        });
    }

    /**
     * Create Customer Return.
     */
    public function createCustomerReturn(array $data, User $user): CustomerReturn
    {
        return DB::transaction(function () use ($data, $user) {
            $order = Order::findOrFail($data['order_id']);

            // Rule 22: Customer return hanya bisa dilakukan terhadap transaksi yang statusnya paid (bukan voided)
            if ($order->status !== 'paid') {
                throw new \Exception("Retur pelanggan hanya bisa dilakukan pada transaksi yang berstatus LUNAS (PAID). Status saat ini: {$order->status}");
            }

            $returnNumber = $this->generateCustomerReturnNumber($user->outlet_id);

            $cr = CustomerReturn::create([
                'outlet_id' => $user->outlet_id,
                'order_id' => $order->id,
                'customer_id' => $order->customer_id,
                'user_id' => $user->id,
                'return_number' => $returnNumber,
                'type' => $data['type'], // 'refund', 'exchange'
                'status' => 'draft',
                'total_amount' => $data['total_amount'] ?? 0,
                'note' => $data['note'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $orderItem = OrderItem::findOrFail($item['order_item_id']);
                CustomerReturnItem::create([
                    'return_id' => $cr->id,
                    'order_item_id' => $orderItem->id,
                    'product_id' => $orderItem->product_id,
                    'product_name' => $orderItem->product_name,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['product_price'],
                    'subtotal' => $item['quantity'] * $item['product_price'],
                    'reason' => $item['reason'] ?? null,
                ]);
            }

            return $cr;
        });
    }

    /**
     * Confirm Customer Return (Restores stock).
     */
    public function confirmCustomerReturn(CustomerReturn $cr, User $user): CustomerReturn
    {
        return DB::transaction(function () use ($cr, $user) {
            if ($cr->status === 'confirmed') {
                throw new \Exception("Retur pelanggan ini sudah dikonfirmasi.");
            }

            $cr->status = 'confirmed';
            $cr->save();

            $cr->load('items.product');

            foreach ($cr->items as $item) {
                $this->stockService->customerReturn(
                    $item->product,
                    (float) $item->quantity,
                    $user,
                    "Retur pelanggan #{$cr->return_number} (Order Ref: #{$cr->order->order_number})"
                );
            }

            return $cr;
        });
    }
}
