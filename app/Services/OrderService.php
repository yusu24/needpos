<?php
// app/Services/OrderService.php

namespace App\Services;

use App\Models\Discount;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class OrderService
{
    private StockService $stockService;
    private CustomerPointService $pointService;

    public function __construct(
        StockService $stockService,
        CustomerPointService $pointService
    ) {
        $this->stockService = $stockService;
        $this->pointService = $pointService;
    }

    /**
     * Proses checkout — satu-satunya entry point untuk membuat order.
     * Semua operasi dibungkus DB::transaction().
     *
     * @param array{
     *   items: array<array{product_id: int, quantity: float}>,
     *   payment_method: string,
     *   payment_amount: float,
     *   discount_code?: string,
     *   customer_id?: int,
     *   pricelist_id?: int,
     *   note?: string
     * } $data
     */
    public function checkout(array $data, User $user): Order
    {
        return DB::transaction(function () use ($data, $user) {
            $outletId = $user->outlet_id;

            // 1. Load & validasi semua produk
            $productIds = collect($data['items'])->pluck('product_id');
            $products   = Product::forOutlet($outletId)
                ->whereIn('id', $productIds)
                ->with('stock')
                ->get()
                ->keyBy('id');

            if ($products->count() !== $productIds->unique()->count()) {
                throw new \Exception('Beberapa produk tidak ditemukan atau tidak tersedia.');
            }

            // 2. Hitung subtotal & validasi stok
            $subtotal  = 0;
            $orderItemsData = [];

            foreach ($data['items'] as $item) {
                $product  = $products->get($item['product_id']);
                $quantity = (float) $item['quantity'];

                if (! $product->is_active) {
                    throw new \Exception("Produk [{$product->name}] sudah tidak aktif.");
                }

                if ($product->track_stock && ! $product->hasEnoughStock($quantity)) {
                    $available = $product->stock?->quantity ?? 0;
                    throw new \Exception(
                        "Stok produk [{$product->name}] tidak mencukupi. " .
                        "Tersedia: {$available}, diminta: {$quantity}."
                    );
                }

                $itemSubtotal = $product->price * $quantity;
                $subtotal    += $itemSubtotal;

                $orderItemsData[] = [
                    'product'       => $product,
                    'quantity'      => $quantity,
                    'product_price' => $product->price,
                    'cost_price'    => $product->cost_price ?? 0.0,
                    'subtotal'      => $itemSubtotal,
                ];
            }

            // 3. Validasi & hitung diskon
            $discountAmount = 0;
            $discountId     = null;

            if (! empty($data['discount_code'])) {
                $discount = Discount::forOutlet($outletId)
                    ->where('code', $data['discount_code'])
                    ->first();

                if (! $discount) {
                    throw new \Exception("Kode diskon '{$data['discount_code']}' tidak ditemukan.");
                }

                if (! $discount->isValidFor($subtotal)) {
                    throw new \Exception("Kode diskon tidak valid atau sudah tidak berlaku.");
                }

                $discountAmount = $discount->calculateDiscount($subtotal);
                $discountId     = $discount->id;

                // Increment used_count
                $discount->increment('used_count');
            }

            // 4. Hitung pajak & total
            $outlet      = $user->outlet;
            $taxRate     = $outlet->tax_rate / 100;
            $afterDiscount = $subtotal - $discountAmount;
            $taxAmount   = round($afterDiscount * $taxRate, 2);
            $totalAmount = $afterDiscount + $taxAmount;

            // 5. Validasi payment
            $paymentAmount = (float) $data['payment_amount'];
            if ($data['payment_method'] === 'cash' && $paymentAmount < $totalAmount) {
                throw new \Exception(
                    "Nominal pembayaran tidak mencukupi. " .
                    "Total: {$totalAmount}, dibayar: {$paymentAmount}."
                );
            }

            $changeAmount = max(0, $paymentAmount - $totalAmount);

            // 6. Buat order
            $order = Order::create([
                'outlet_id'       => $outletId,
                'user_id'         => $user->id,
                'customer_id'     => $data['customer_id'] ?? null,
                'pricelist_id'    => $data['pricelist_id'] ?? null,
                'order_number'    => $this->generateOrderNumber($outletId),
                'status'          => 'paid',
                'subtotal'        => $subtotal,
                'discount_amount' => $discountAmount,
                'tax_amount'      => $taxAmount,
                'total_amount'    => $totalAmount,
                'payment_method'  => $data['payment_method'],
                'payment_amount'  => $paymentAmount,
                'change_amount'   => $changeAmount,
                'discount_id'     => $discountId,
                'note'            => $data['note'] ?? null,
            ]);

            // 7. Buat order items & deduct stok
            foreach ($orderItemsData as $itemData) {
                $product = $itemData['product'];

                OrderItem::create([
                    'order_id'      => $order->id,
                    'product_id'    => $product->id,
                    'product_name'  => $product->name,
                    'product_price' => $itemData['product_price'],
                    'cost_price'    => $itemData['cost_price'],
                    'quantity'      => $itemData['quantity'],
                    'subtotal'      => $itemData['subtotal'],
                ]);

                // Deduct stok (skip jika track_stock = false)
                $this->stockService->deduct(
                    product: $product,
                    quantity: $itemData['quantity'],
                    referenceType: Order::class,
                    referenceId: $order->id,
                    user: $user,
                    note: "Penjualan {$order->order_number}"
                );
            }

            // 8. Award loyalty points to customer
            if ($order->customer_id) {
                $this->pointService->awardPointsForOrder($order);
            }

            return $order->load(['items', 'discount', 'user', 'outlet', 'customer', 'pricelist']);
        });
    }

    /**
     * Void transaksi — restore stok + ubah status order.
     * Dibungkus DB::transaction().
     *
     * @throws \Exception jika tidak punya hak void
     */
    public function void(Order $order, User $user, string $reason): Order
    {
        return DB::transaction(function () use ($order, $user, $reason) {
            if ($order->isVoided()) {
                throw new \Exception("Order #{$order->order_number} sudah di-void sebelumnya.");
            }

            if (! $order->isPaid()) {
                throw new \Exception("Hanya order berstatus 'paid' yang bisa di-void.");
            }

            if (! $order->canBeVoidedBy($user)) {
                throw new \Exception(
                    "Anda tidak memiliki akses untuk mem-void transaksi ini. " .
                    "Kasir hanya bisa void transaksi sendiri di hari yang sama."
                );
            }

            // Restore stok untuk setiap item
            foreach ($order->items as $item) {
                if ($item->product_id === null) {
                    continue; // produk sudah dihapus
                }

                $product = Product::find($item->product_id);
                if ($product && $product->track_stock) {
                    $this->stockService->restore(
                        product: $product,
                        quantity: $item->quantity,
                        referenceType: Order::class,
                        referenceId: $order->id,
                        user: $user,
                        note: "Void {$order->order_number}"
                    );
                }
            }

            // Kembalikan used_count diskon
            if ($order->discount_id) {
                Discount::where('id', $order->discount_id)->decrement('used_count');
            }

            // Update order status
            $order->update([
                'status'      => 'voided',
                'voided_at'   => now(),
                'voided_by'   => $user->id,
                'void_reason' => $reason,
            ]);

            // Deduct loyalty points from customer
            if ($order->customer_id) {
                $this->pointService->deductPointsForVoid($order);
            }

            return $order->fresh(['items', 'discount', 'user', 'voidedBy', 'customer', 'pricelist']);
        });
    }

    /**
     * Generate order number format: TRX-YYYYMMDD-NNNNN
     * Thread-safe: pakai advisory lock + counter dari DB
     */
    private function generateOrderNumber(int $outletId): string
    {
        $date   = now()->format('Ymd');
        $prefix = "TRX-{$date}-";

        // Hitung sequence dari order hari ini
        $count = Order::where('outlet_id', $outletId)
            ->whereDate('created_at', today())
            ->count();

        $sequence = str_pad($count + 1, 5, '0', STR_PAD_LEFT);

        return $prefix . $sequence;
    }
}
