<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveSupplierReturnRequest;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\SupplierReturn;
use App\Services\ReturnService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierReturnController extends Controller
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

        $supplierReturns = SupplierReturn::where('outlet_id', $outletId)
            ->with(['supplier', 'user'])
            ->when($search, function ($query, $search) {
                $query->where('return_number', 'like', "%{$search}%")
                    ->orWhereHas('supplier', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('ReturSupplier/Index', [
            'supplierReturns' => $supplierReturns,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(Request $request)
    {
        $outletId = $request->user()->outlet_id;
        $suppliers = Supplier::where('outlet_id', $outletId)->where('is_active', true)->get();
        $products = Product::where('outlet_id', $outletId)->where('is_active', true)->with('stock')->get();

        return Inertia::render('ReturSupplier/Form', [
            'suppliers' => $suppliers,
            'products' => $products,
        ]);
    }

    public function store(SaveSupplierReturnRequest $request)
    {
        $user = $request->user();
        $this->returnService->createSupplierReturn($request->validated(), $user);

        return redirect()->route('admin.supplier-returns.index')->with('success', 'Retur ke Supplier berhasil dibuat.');
    }

    public function confirm(Request $request, SupplierReturn $supplierReturn)
    {
        if ($supplierReturn->outlet_id !== $request->user()->outlet_id) {
            abort(403);
        }

        try {
            $user = $request->user();
            $this->returnService->confirmSupplierReturn($supplierReturn, $user);

            return redirect()->route('admin.supplier-returns.index')->with('success', 'Retur ke Supplier berhasil dikonfirmasi dan stok berkurang.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy(Request $request, SupplierReturn $supplierReturn)
    {
        if ($supplierReturn->outlet_id !== $request->user()->outlet_id) {
            abort(403);
        }

        if ($supplierReturn->status === 'confirmed') {
            return back()->withErrors(['error' => 'Retur ke Supplier yang sudah dikonfirmasi tidak bisa dihapus.']);
        }

        $supplierReturn->delete();

        return redirect()->route('admin.supplier-returns.index')->with('success', 'Retur ke Supplier berhasil dihapus.');
    }
}
