<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReceiveGoodsRequest;
use App\Models\PurchaseOrder;
use App\Models\PurchaseReceive;
use App\Services\PurchaseOrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseReceiveController extends Controller
{
    protected PurchaseOrderService $poService;

    public function __construct(PurchaseOrderService $poService)
    {
        $this->poService = $poService;
    }

    public function create(Request $request, PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->outlet_id !== $request->user()->outlet_id) {
            abort(403);
        }

        // Cannot receive if already completed or cancelled
        if (in_array($purchaseOrder->status, ['received', 'cancelled'])) {
            return redirect()->route('admin.purchase-orders.show', $purchaseOrder->id)
                ->withErrors(['status' => 'PO ini sudah selesai atau dibatalkan.']);
        }

        $purchaseOrder->load('items.product');

        return Inertia::render('PurchaseReceive/Form', [
            'purchaseOrder' => $purchaseOrder,
        ]);
    }

    public function store(ReceiveGoodsRequest $request, PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->outlet_id !== $request->user()->outlet_id) {
            abort(403);
        }

        try {
            $user = $request->user();
            $this->poService->receiveGoods($purchaseOrder, $request->validated(), $user);

            return redirect()->route('admin.purchase-orders.show', $purchaseOrder->id)
                ->with('success', 'Penerimaan barang berhasil disimpan.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
