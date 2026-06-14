<?php
// app/Http/Controllers/DashboardController.php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user     = $request->user();
        $outletId = $user->outlet_id;
        $userRole = $user->roles->first()?->name ?? '';

        $stats            = [];
        $recentOrders     = [];
        $lowStockProducts = [];

        if (in_array($userRole, ['owner', 'manager'])) {
            $today     = now()->toDateString();
            $yesterday = now()->subDay()->toDateString();

            // Orders today
            $ordersToday = Order::where('outlet_id', $outletId)
                ->whereDate('created_at', $today)
                ->where('status', '!=', 'voided')
                ->count();

            // Orders yesterday (for trend)
            $ordersYesterday = Order::where('outlet_id', $outletId)
                ->whereDate('created_at', $yesterday)
                ->where('status', '!=', 'voided')
                ->count();

            // Revenue today
            $revenueToday = Order::where('outlet_id', $outletId)
                ->whereDate('created_at', $today)
                ->where('status', '!=', 'voided')
                ->sum('total_amount');

            // Revenue yesterday
            $revenueYesterday = Order::where('outlet_id', $outletId)
                ->whereDate('created_at', $yesterday)
                ->where('status', '!=', 'voided')
                ->sum('total_amount');

            $stats = [
                'orders_today'   => $ordersToday,
                'orders_trend'   => $ordersYesterday > 0
                    ? round((($ordersToday - $ordersYesterday) / $ordersYesterday) * 100)
                    : null,
                'revenue_today'  => $revenueToday,
                'revenue_trend'  => $revenueYesterday > 0
                    ? round((($revenueToday - $revenueYesterday) / $revenueYesterday) * 100)
                    : null,
                'products_count' => Product::where('outlet_id', $outletId)->where('is_active', true)->count(),
                'users_count'    => User::where('outlet_id', $outletId)->count(),
            ];

            // 5 most recent orders
            $recentOrders = Order::where('outlet_id', $outletId)
                ->with(['user:id,name'])
                ->latest()
                ->limit(5)
                ->get(['id', 'order_number', 'total_amount', 'status', 'user_id', 'created_at'])
                ->map(function ($order) {
                    return [
                        'id'             => $order->id,
                        'order_number'   => $order->order_number,
                        'total_amount'   => $order->total_amount,
                        'payment_status' => $order->status,
                        'cashier'        => $order->user ? ['name' => $order->user->name] : null,
                        'created_at'     => $order->created_at,
                    ];
                });

            // Low stock products (stock <= min_quantity)
            $lowStockProducts = Product::where('outlet_id', $outletId)
                ->where('is_active', true)
                ->where('track_stock', true)
                ->with(['stock:id,product_id,quantity,min_quantity', 'category:id,name'])
                ->get()
                ->filter(function ($product) {
                    $qty = $product->stock?->quantity ?? 0;
                    $min = $product->stock?->min_quantity ?? 5;
                    return $qty <= $min;
                })
                ->sortBy(fn($p) => $p->stock?->quantity ?? 0)
                ->take(5)
                ->values();
        }

        return Inertia::render('Dashboard', [
            'stats'            => $stats,
            'recentOrders'     => $recentOrders,
            'lowStockProducts' => $lowStockProducts,
        ]);
    }
}
