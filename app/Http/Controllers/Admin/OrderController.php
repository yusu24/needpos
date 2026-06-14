<?php
// app/Http/Controllers/Admin/OrderController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\VoidOrderRequest;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService
    ) {}

    /**
     * Daftar transaksi — paginated, filterable by date/status/payment
     */
    public function index(Request $request): Response
    {
        $outletId = $request->user()->outlet_id;

        $orders = Order::forOutlet($outletId)
            ->with(['user:id,name', 'discount:id,code,name'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->payment_method, fn ($q) =>
                $q->where('payment_method', $request->payment_method)
            )
            ->when($request->date_from, fn ($q) =>
                $q->whereDate('created_at', '>=', $request->date_from)
            )
            ->when($request->date_to, fn ($q) =>
                $q->whereDate('created_at', '<=', $request->date_to)
            )
            ->when($request->search, fn ($q) =>
                $q->where('order_number', 'like', "%{$request->search}%")
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Transaksi/Index', [
            'orders'  => $orders,
            'filters' => $request->only(['status', 'payment_method', 'date_from', 'date_to', 'search']),
        ]);
    }

    /**
     * Detail satu transaksi beserta semua item
     */
    public function show(Request $request, Order $order): Response
    {
        abort_unless($order->outlet_id === $request->user()->outlet_id, 403);

        $order->load(['items.product:id,name', 'user:id,name', 'discount', 'voidedBy:id,name']);

        return Inertia::render('Transaksi/Show', [
            'order' => $order,
        ]);
    }

    /**
     * Void transaksi — semua logic di OrderService::void()
     */
    public function void(VoidOrderRequest $request, Order $order): JsonResponse
    {
        abort_unless($order->outlet_id === $request->user()->outlet_id, 403);

        try {
            $voidedOrder = $this->orderService->void(
                order: $order,
                user: $request->user(),
                reason: $request->validated('reason')
            );

            return response()->json([
                'success' => true,
                'message' => "Order #{$voidedOrder->order_number} berhasil di-void.",
                'order'   => [
                    'id'          => $voidedOrder->id,
                    'order_number'=> $voidedOrder->order_number,
                    'status'      => $voidedOrder->status,
                    'voided_at'   => $voidedOrder->voided_at?->toISOString(),
                    'void_reason' => $voidedOrder->void_reason,
                    'voided_by'   => $voidedOrder->voidedBy?->name,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
