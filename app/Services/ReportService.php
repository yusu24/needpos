<?php
// app/Services/ReportService.php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Get aggregate statistics (Summary metrics).
     */
    public function getSummary(int $outletId, string $dateFrom, string $dateTo): array
    {
        $ordersQuery = Order::forOutlet($outletId)
            ->where('status', 'paid')
            ->whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo);

        $summary = $ordersQuery->select([
            DB::raw('COUNT(id) as total_orders'),
            DB::raw('SUM(subtotal) as total_subtotal'),
            DB::raw('SUM(discount_amount) as total_discount'),
            DB::raw('SUM(tax_amount) as total_tax'),
            DB::raw('SUM(total_amount) as total_revenue'),
        ])->first()->toArray();

        // Convert string nulls to numeric 0
        $totalRevenue = (float)($summary['total_revenue'] ?? 0);
        $totalOrders = (int)($summary['total_orders'] ?? 0);
        $totalDiscount = (float)($summary['total_discount'] ?? 0);
        $totalTax = (float)($summary['total_tax'] ?? 0);

        // Calculate COGS (Cost of Goods Sold) using snapshot cost_price
        $cogs = (float)OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.outlet_id', $outletId)
            ->where('orders.status', 'paid')
            ->whereDate('orders.created_at', '>=', $dateFrom)
            ->whereDate('orders.created_at', '<=', $dateTo)
            ->sum(DB::raw('order_items.quantity * order_items.cost_price'));

        $profit = $totalRevenue - $cogs;

        return [
            'total_orders'    => $totalOrders,
            'total_revenue'   => $totalRevenue,
            'total_discount'  => $totalDiscount,
            'total_tax'       => $totalTax,
            'cogs'            => $cogs,
            'profit'          => $profit,
            'avg_order_value' => $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0,
        ];
    }

    /**
     * Get sales trends grouped by day.
     */
    public function getDailySales(int $outletId, string $dateFrom, string $dateTo): array
    {
        return Order::forOutlet($outletId)
            ->where('status', 'paid')
            ->whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo)
            ->select([
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(id) as orders_count'),
            ])
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    /**
     * Get breakdown of payment methods.
     */
    public function getPaymentBreakdown(int $outletId, string $dateFrom, string $dateTo): array
    {
        return Order::forOutlet($outletId)
            ->where('status', 'paid')
            ->whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo)
            ->select([
                'payment_method',
                DB::raw('COUNT(id) as count'),
                DB::raw('SUM(total_amount) as revenue'),
            ])
            ->groupBy('payment_method')
            ->get()
            ->toArray();
    }

    /**
     * Get list of top selling products.
     */
    public function getTopProducts(int $outletId, string $dateFrom, string $dateTo, int $limit = 5): array
    {
        return OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.outlet_id', $outletId)
            ->where('orders.status', 'paid')
            ->whereDate('orders.created_at', '>=', $dateFrom)
            ->whereDate('orders.created_at', '<=', $dateTo)
            ->select([
                'order_items.product_name',
                DB::raw('SUM(order_items.quantity) as quantity_sold'),
                DB::raw('SUM(order_items.subtotal) as total_revenue'),
            ])
            ->groupBy('order_items.product_id', 'order_items.product_name')
            ->orderByDesc('quantity_sold')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get Detailed Profit & Loss.
     */
    public function getProfitLossDetailed(int $outletId, string $dateFrom, string $dateTo): array
    {
        $summary = $this->getSummary($outletId, $dateFrom, $dateTo);

        // Fetch sales items breakdown with margin calculations
        $items = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.outlet_id', $outletId)
            ->where('orders.status', 'paid')
            ->whereDate('orders.created_at', '>=', $dateFrom)
            ->whereDate('orders.created_at', '<=', $dateTo)
            ->select([
                'order_items.product_name',
                DB::raw('SUM(order_items.quantity) as quantity_sold'),
                DB::raw('SUM(order_items.subtotal) as sales_amount'),
                DB::raw('SUM(order_items.quantity * order_items.cost_price) as cogs_amount'),
                DB::raw('SUM(order_items.subtotal - (order_items.quantity * order_items.cost_price)) as profit_amount'),
            ])
            ->groupBy('order_items.product_id', 'order_items.product_name')
            ->get()
            ->toArray();

        return [
            'summary' => $summary,
            'items' => $items,
        ];
    }

    /**
     * Get Purchases Report.
     */
    public function getPurchasesReport(int $outletId, string $dateFrom, string $dateTo): array
    {
        // Total PO created vs Received vs Sent
        $poStats = \App\Models\PurchaseOrder::where('outlet_id', $outletId)
            ->whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo)
            ->select([
                'status',
                DB::raw('COUNT(id) as count'),
                DB::raw('SUM(total_amount) as total_amount'),
            ])
            ->groupBy('status')
            ->get()
            ->toArray();

        // Detailed receives logs
        $receives = \App\Models\PurchaseReceive::where('outlet_id', $outletId)
            ->with(['purchaseOrder', 'user'])
            ->whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo)
            ->orderBy('id', 'desc')
            ->get();

        $totalSpent = \App\Models\PurchaseReceiveItem::join('purchase_receives', 'purchase_receive_items.receive_id', '=', 'purchase_receives.id')
            ->where('purchase_receives.outlet_id', $outletId)
            ->whereDate('purchase_receives.created_at', '>=', $dateFrom)
            ->whereDate('purchase_receives.created_at', '<=', $dateTo)
            ->sum('purchase_receive_items.subtotal');

        return [
            'po_stats' => $poStats,
            'receives' => $receives,
            'total_spent' => (float) $totalSpent,
        ];
    }

    /**
     * Get Returns Report.
     */
    public function getReturnsReport(int $outletId, string $dateFrom, string $dateTo): array
    {
        // Supplier Returns
        $supplierReturns = \App\Models\SupplierReturn::where('outlet_id', $outletId)
            ->where('status', 'confirmed')
            ->whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo)
            ->select([
                DB::raw('COUNT(id) as count'),
                DB::raw('SUM(total_amount) as total_amount'),
            ])
            ->first();

        // Customer Returns
        $customerReturns = \App\Models\CustomerReturn::where('outlet_id', $outletId)
            ->where('status', 'confirmed')
            ->whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo)
            ->select([
                DB::raw('COUNT(id) as count'),
                DB::raw('SUM(total_amount) as total_amount'),
            ])
            ->first();

        $supplierReturnsList = \App\Models\SupplierReturn::where('outlet_id', $outletId)
            ->with(['supplier', 'user'])
            ->whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo)
            ->orderBy('id', 'desc')
            ->get();

        $customerReturnsList = \App\Models\CustomerReturn::where('outlet_id', $outletId)
            ->with(['order', 'customer', 'user'])
            ->whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo)
            ->orderBy('id', 'desc')
            ->get();

        return [
            'summary' => [
                'supplier_returns_count' => (int) $supplierReturns->count,
                'supplier_returns_amount' => (float) $supplierReturns->total_amount,
                'customer_returns_count' => (int) $customerReturns->count,
                'customer_returns_amount' => (float) $customerReturns->total_amount,
            ],
            'supplier_returns' => $supplierReturnsList,
            'customer_returns' => $customerReturnsList,
        ];
    }
}
