<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SavePurchaseOrderRequest;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Services\PurchaseOrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    protected PurchaseOrderService $poService;

    public function __construct(PurchaseOrderService $poService)
    {
        $this->poService = $poService;
    }

    public function index(Request $request)
    {
        $outletId = $request->user()->outlet_id;
        $search = $request->input('search');
        $perPage = min((int) $request->input('per_page', 10), 100);

        $purchaseOrders = PurchaseOrder::where('outlet_id', $outletId)
            ->with(['supplier', 'user'])
            ->when($search, function ($query, $search) {
                $query->where('po_number', 'like', "%{$search}%")
                    ->orWhereHas('supplier', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('PurchaseOrder/Index', [
            'purchaseOrders' => $purchaseOrders,
            'filters' => ['search' => $search, 'per_page' => $perPage],
        ]);
    }

    public function create(Request $request)
    {
        $outletId = $request->user()->outlet_id;
        $suppliers = Supplier::where('outlet_id', $outletId)->where('is_active', true)->get();
        $products = Product::where('outlet_id', $outletId)->where('is_active', true)->get();

        return Inertia::render('PurchaseOrder/Form', [
            'suppliers' => $suppliers,
            'products' => $products,
        ]);
    }

    public function store(SavePurchaseOrderRequest $request)
    {
        $user = $request->user();
        $this->poService->create($request->validated(), $user);

        return redirect()->route('admin.purchase-orders.index')->with('success', 'Purchase Order berhasil dibuat.');
    }

    public function show(Request $request, PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->outlet_id !== $request->user()->outlet_id) {
            abort(403);
        }

        $purchaseOrder->load(['supplier', 'user', 'items.product', 'receives.items.product']);

        return Inertia::render('PurchaseOrder/Show', [
            'purchaseOrder' => $purchaseOrder,
        ]);
    }

    public function updateStatus(Request $request, PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->outlet_id !== $request->user()->outlet_id) {
            abort(403);
        }

        $request->validate([
            'status' => 'required|in:sent,cancelled',
        ]);

        $newStatus = $request->input('status');

        // PO status can only move forward: draft -> sent -> partial/received -> cancelled
        // If sent, can only proceed from draft
        if ($newStatus === 'sent' && $purchaseOrder->status !== 'draft') {
            return back()->withErrors(['status' => 'Hanya PO draft yang bisa dikirim.']);
        }

        // If cancelled, cannot cancel received ones
        if ($newStatus === 'cancelled' && in_array($purchaseOrder->status, ['received', 'cancelled'])) {
            return back()->withErrors(['status' => 'PO yang sudah diterima atau dibatalkan tidak bisa dibatalkan lagi.']);
        }

        $purchaseOrder->update(['status' => $newStatus]);

        return back()->with('success', "Status PO berhasil diubah menjadi {$newStatus}.");
    }
}
