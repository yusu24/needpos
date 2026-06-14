<?php
// app/Http/Controllers/Kasir/PosController.php

namespace App\Http\Controllers\Kasir;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kasir\CheckoutRequest;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService
    ) {}

    /**
     * Tampilkan layar kasir utama.
     * Kirim produk + kategori aktif ke React via Inertia.
     */
    public function index(Request $request): Response
    {
        $outletId = $request->user()->outlet_id;

        $categories = Category::forOutlet($outletId)
            ->active()
            ->get(['id', 'name', 'color', 'icon']);

        $products = Product::forOutlet($outletId)
            ->active()
            ->with(['category:id,name,color', 'stock:product_id,outlet_id,quantity,min_quantity'])
            ->when($request->search, fn ($q) =>
                $q->where(function ($q) use ($request) {
                    $q->where('name', 'like', "%{$request->search}%")
                      ->orWhere('barcode', $request->search)
                      ->orWhere('sku', 'like', "%{$request->search}%");
                })
            )
            ->when($request->category_id, fn ($q) =>
                $q->where('category_id', $request->category_id)
            )
            ->select([
                'id', 'category_id', 'name', 'price',
                'image', 'unit', 'track_stock', 'barcode',
                // TIDAK expose cost_price ke frontend
            ])
            ->orderBy('name')
            ->get();

        return Inertia::render('Kasir/Index', [
            'categories' => $categories,
            'products'   => $products,
            'outlet'     => $request->user()->outlet()->select([
                'id', 'name', 'tax_rate', 'logo', 'address', 'phone',
            ])->first(),
        ]);
    }

    /**
     * Proses checkout.
     * Semua validasi dilakukan di CheckoutRequest, bisnis logic di OrderService.
     */
    public function checkout(CheckoutRequest $request): JsonResponse
    {
        try {
            $order = $this->orderService->checkout(
                data: $request->validated(),
                user: $request->user()
            );

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil.',
                'order'   => [
                    'id'             => $order->id,
                    'order_number'   => $order->order_number,
                    'subtotal'       => $order->subtotal,
                    'discount_amount'=> $order->discount_amount,
                    'tax_amount'     => $order->tax_amount,
                    'total_amount'   => $order->total_amount,
                    'payment_method' => $order->payment_method,
                    'payment_amount' => $order->payment_amount,
                    'change_amount'  => $order->change_amount,
                    'note'           => $order->note,
                    'created_at'     => $order->created_at->toISOString(),
                    'cashier'        => $order->user->name,
                    'outlet'         => [
                        'name'    => $order->outlet->name,
                        'address' => $order->outlet->address,
                        'phone'   => $order->outlet->phone,
                    ],
                    'items' => $order->items->map(fn ($item) => [
                        'product_name'  => $item->product_name,
                        'product_price' => $item->product_price,
                        'quantity'      => $item->quantity,
                        'subtotal'      => $item->subtotal,
                    ]),
                    'discount' => $order->discount ? [
                        'code' => $order->discount->code,
                        'name' => $order->discount->name,
                    ] : null,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Ambil data order untuk reprint struk.
     */
    public function receipt(Request $request, Order $order): JsonResponse
    {
        // Pastikan order milik outlet yang sama
        abort_unless($order->outlet_id === $request->user()->outlet_id, 403);

        $order->load(['items', 'user', 'outlet', 'discount']);

        return response()->json([
            'order' => [
                'order_number'   => $order->order_number,
                'status'         => $order->status,
                'subtotal'       => $order->subtotal,
                'discount_amount'=> $order->discount_amount,
                'tax_amount'     => $order->tax_amount,
                'total_amount'   => $order->total_amount,
                'payment_method' => $order->payment_method,
                'payment_amount' => $order->payment_amount,
                'change_amount'  => $order->change_amount,
                'created_at'     => $order->created_at->toISOString(),
                'cashier'        => $order->user->name,
                'outlet'         => [
                    'name'    => $order->outlet->name,
                    'address' => $order->outlet->address,
                    'phone'   => $order->outlet->phone,
                ],
                'items' => $order->items->map(fn ($item) => [
                    'product_name'  => $item->product_name,
                    'product_price' => $item->product_price,
                    'quantity'      => $item->quantity,
                    'subtotal'      => $item->subtotal,
                ]),
            ],
        ]);
    }

    /**
     * Validasi diskon kode.
     */
    public function validateDiscount(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $outletId = $request->user()->outlet_id;

        $discount = \App\Models\Discount::forOutlet($outletId)
            ->where('code', $request->code)
            ->first();

        if (! $discount) {
            return response()->json([
                'success' => false,
                'message' => "Kode diskon '{$request->code}' tidak ditemukan.",
            ], 422);
        }

        if (! $discount->isValidFor((float)$request->subtotal)) {
            return response()->json([
                'success' => false,
                'message' => "Kode diskon tidak memenuhi syarat minimal pembelian atau sudah kedaluwarsa.",
            ], 422);
        }

        return response()->json([
            'success' => true,
            'discount' => [
                'id' => $discount->id,
                'code' => $discount->code,
                'name' => $discount->name,
                'type' => $discount->type,
                'value' => (float)$discount->value,
                'min_purchase' => (float)$discount->min_purchase,
            ],
            'discount_amount' => $discount->calculateDiscount((float)$request->subtotal),
        ]);
    }
}
