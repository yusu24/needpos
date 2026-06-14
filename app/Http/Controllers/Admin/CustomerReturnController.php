<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveCustomerReturnRequest;
use App\Models\CustomerReturn;
use App\Models\Order;
use App\Services\ReturnService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerReturnController extends Controller
{
    protected ReturnService $returnService;

    public function __construct(ReturnService $returnService)
    {
        $this->returnService = $returnService;
    }

    public function index(Request $request)
    {
        $outletId = $request->user()->outlet_id;
        $search = $request->input('search');
        $perPage = min((int) $request->input('per_page', 10), 100);

        $customerReturns = CustomerReturn::where('outlet_id', $outletId)
            ->with(['order', 'customer', 'user'])
            ->when($search, function ($query, $search) {
                $query->where('return_number', 'like', "%{$search}%")
                    ->orWhereHas('order', function ($q) use ($search) {
                        $q->where('order_number', 'like', "%{$search}%");
                    })
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('ReturPenjualan/Index', [
            'customerReturns' => $customerReturns,
            'filters' => ['search' => $search, 'per_page' => $perPage],
        ]);
    }

    public function create(Request $request)
    {
        $outletId = $request->user()->outlet_id;
        $orders = Order::where('outlet_id', $outletId)
            ->where('status', 'paid')
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('ReturPenjualan/Form', [
            'orders' => $orders,
        ]);
    }

    public function getOrderDetails(Request $request, Order $order)
    {
        if ($order->outlet_id !== $request->user()->outlet_id) {
            abort(403);
        }

        $order->load(['items.product', 'customer']);

        return response()->json($order);
    }

    public function store(SaveCustomerReturnRequest $request)
    {
        $user = $request->user();

        try {
            $this->returnService->createCustomerReturn($request->validated(), $user);
            return redirect()->route('admin.customer-returns.index')->with('success', 'Retur penjualan berhasil diajukan.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function confirm(Request $request, CustomerReturn $customerReturn)
    {
        if ($customerReturn->outlet_id !== $request->user()->outlet_id) {
            abort(403);
        }

        try {
            $user = $request->user();
            $this->returnService->confirmCustomerReturn($customerReturn, $user);

            return redirect()->route('admin.customer-returns.index')->with('success', 'Retur penjualan berhasil dikonfirmasi dan stok telah dikembalikan.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy(Request $request, CustomerReturn $customerReturn)
    {
        if ($customerReturn->outlet_id !== $request->user()->outlet_id) {
            abort(403);
        }

        if ($customerReturn->status === 'confirmed') {
            return back()->withErrors(['error' => 'Retur penjualan yang sudah dikonfirmasi tidak bisa dihapus.']);
        }

        $customerReturn->delete();

        return redirect()->route('admin.customer-returns.index')->with('success', 'Retur penjualan berhasil dihapus.');
    }
}
