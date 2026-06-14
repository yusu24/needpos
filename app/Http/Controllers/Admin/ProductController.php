<?php
// app/Http/Controllers/Admin/ProductController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\Stock;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * List all products with search & category filters.
     */
    public function index(Request $request): Response
    {
        $outletId = $request->user()->outlet_id;

        $categories = Category::forOutlet($outletId)->active()->get();

        $products = Product::forOutlet($outletId)
            ->with(['category:id,name,color', 'stock'])
            ->when($request->search, fn ($q) =>
                $q->where(function ($q) use ($request) {
                    $q->where('name', 'like', "%{$request->search}%")
                      ->orWhere('sku', 'like', "%{$request->search}%")
                      ->orWhere('barcode', 'like', "%{$request->search}%");
                })
            )
            ->when($request->category_id, fn ($q) => $q->where('category_id', $request->category_id))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Produk/Index', [
            'products'   => $products,
            'categories' => $categories,
            'filters'    => $request->only(['search', 'category_id']),
        ]);
    }

    /**
     * Form to create a new product.
     */
    public function create(Request $request): Response
    {
        $outletId = $request->user()->outlet_id;
        $categories = Category::forOutlet($outletId)->active()->get(['id', 'name']);

        return Inertia::render('Produk/Form', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store new product.
     */
    public function store(SaveProductRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['outlet_id'] = $request->user()->outlet_id;

        DB::transaction(function () use ($data, $request) {
            if ($request->hasFile('image_file')) {
                $path = $request->file('image_file')->store('products', 'public');
                $data['image'] = Storage::url($path);
            }

            $product = Product::create($data);

            // Initialize Stock record
            Stock::create([
                'product_id'   => $product->id,
                'outlet_id'    => $product->outlet_id,
                'quantity'     => $request->initial_stock ?? 0,
                'min_quantity' => $request->min_stock ?? 5,
            ]);
        });

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil dibuat.');
    }

    /**
     * Form to edit an existing product.
     */
    public function edit(Request $request, Product $product): Response
    {
        abort_unless($product->outlet_id === $request->user()->outlet_id, 403);
        
        $outletId = $request->user()->outlet_id;
        $categories = Category::forOutlet($outletId)->active()->get(['id', 'name']);
        
        $product->load('stock');

        return Inertia::render('Produk/Form', [
            'product'    => $product,
            'categories' => $categories,
        ]);
    }

    /**
     * Update product details.
     */
    public function update(SaveProductRequest $request, Product $product): RedirectResponse
    {
        abort_unless($product->outlet_id === $request->user()->outlet_id, 403);

        $data = $request->validated();

        DB::transaction(function () use ($product, $data, $request) {
            if ($request->hasFile('image_file')) {
                // Delete old image if exists
                if ($product->image) {
                    $oldPath = str_replace('/storage/', '', $product->image);
                    Storage::disk('public')->delete($oldPath);
                }
                
                $path = $request->file('image_file')->store('products', 'public');
                $data['image'] = Storage::url($path);
            }

            $product->update($data);

            // Update Stock min_quantity
            if ($product->stock) {
                $product->stock->update([
                    'min_quantity' => $request->min_stock ?? 5,
                ]);
            }
        });

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil diperbarui.');
    }

    /**
     * Delete product.
     */
    public function destroy(Request $request, Product $product): RedirectResponse
    {
        abort_unless($product->outlet_id === $request->user()->outlet_id, 403);

        DB::transaction(function () use ($product) {
            // Delete image from storage
            if ($product->image) {
                $oldPath = str_replace('/storage/', '', $product->image);
                Storage::disk('public')->delete($oldPath);
            }

            // Delete associated stock
            $product->stock()->delete();
            $product->delete();
        });

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil dihapus.');
    }
}
