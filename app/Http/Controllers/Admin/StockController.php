<?php
// app/Http/Controllers/Admin/StockController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdjustStockRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Services\StockService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class StockController extends Controller
{
    public function __construct(
        private readonly StockService $stockService
    ) {}

    /**
     * Tampilkan tabel persediaan stok produk saat ini.
     */
    public function index(Request $request): Response
    {
        $outletId = $request->user()->outlet_id;

        $categories = Category::forOutlet($outletId)->active()->get(['id', 'name']);
        $perPage = min((int) $request->input('per_page', 20), 100);

        $stocks = Stock::where('stock.outlet_id', $outletId)
            ->join('products', 'stock.product_id', '=', 'products.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->select([
                'stock.id',
                'stock.product_id',
                'stock.quantity',
                'stock.min_quantity',
                'products.name as product_name',
                'products.sku as product_sku',
                'products.track_stock',
                'categories.name as category_name',
            ])
            ->when($request->search, function ($q) use ($request) {
                $q->where(function ($inner) use ($request) {
                    $inner->where('products.name', 'like', "%{$request->search}%")
                          ->orWhere('products.sku', 'like', "%{$request->search}%");
                });
            })
            ->when($request->category_id, fn ($q) => $q->where('products.category_id', $request->category_id))
            ->when($request->is_low === 'true', fn ($q) => $q->whereRaw('stock.quantity <= stock.min_quantity'))
            ->orderBy('products.name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Stok/Index', [
            'stocks'     => $stocks,
            'categories' => $categories,
            'filters'    => $request->only(['search', 'category_id', 'is_low', 'per_page']),
        ]);
    }

    /**
     * Simpan transaksi penambahan/penyesuaian stok (stock opname).
     */
    public function store(AdjustStockRequest $request): RedirectResponse
    {
        $user = $request->user();
        $product = Product::findOrFail($request->product_id);
        
        abort_unless($product->outlet_id === $user->outlet_id, 403);

        if ($request->type === 'in') {
            $this->stockService->addStock(
                product: $product,
                quantity: (float)$request->quantity,
                user: $user,
                note: $request->note
            );
            $message = 'Stok berhasil ditambahkan.';
        } else {
            $this->stockService->adjustStock(
                product: $product,
                newQuantity: (float)$request->quantity,
                user: $user,
                note: $request->note
            );
            $message = 'Stok berhasil disesuaikan.';
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Tampilkan riwayat audit mutasi/pergerakan stok.
     */
    public function movements(Request $request): Response
    {
        $outletId = $request->user()->outlet_id;
        $perPage = min((int) $request->input('per_page', 25), 100);

        $movements = StockMovement::where('stock_movements.outlet_id', $outletId)
            ->join('products', 'stock_movements.product_id', '=', 'products.id')
            ->join('users', 'stock_movements.user_id', '=', 'users.id')
            ->select([
                'stock_movements.*',
                'products.name as product_name',
                'products.sku as product_sku',
                'users.name as user_name',
            ])
            ->when($request->type, fn ($q) => $q->where('stock_movements.type', $request->type))
            ->when($request->date_from, fn ($q) => $q->whereDate('stock_movements.created_at', '>=', $request->date_from))
            ->when($request->date_to, fn ($q) => $q->whereDate('stock_movements.created_at', '<=', $request->date_to))
            ->when($request->search, function ($q) use ($request) {
                $q->where(function ($inner) use ($request) {
                    $inner->where('products.name', 'like', "%{$request->search}%")
                          ->orWhere('stock_movements.note', 'like', "%{$request->search}%");
                });
            })
            ->latest('stock_movements.created_at')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Stok/Movement', [
            'movements' => $movements,
            'filters'   => $request->only(['type', 'date_from', 'date_to', 'search', 'per_page']),
        ]);
    }
}
