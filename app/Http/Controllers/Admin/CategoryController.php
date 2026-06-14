<?php
// app/Http/Controllers/Admin/CategoryController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveCategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CategoryController extends Controller
{
    /**
     * Tampilkan list kategori.
     */
    public function index(Request $request): Response
    {
        $outletId = $request->user()->outlet_id;
        $categories = Category::forOutlet($outletId)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Kategori/Index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Simpan kategori baru.
     */
    public function store(SaveCategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['outlet_id'] = $request->user()->outlet_id;

        Category::create($data);

        return redirect()->back()->with('success', 'Kategori berhasil ditambahkan.');
    }

    /**
     * Update kategori.
     */
    public function update(SaveCategoryRequest $request, Category $category): RedirectResponse
    {
        abort_unless($category->outlet_id === $request->user()->outlet_id, 403);

        $category->update($request->validated());

        return redirect()->back()->with('success', 'Kategori berhasil diperbarui.');
    }

    /**
     * Hapus kategori.
     */
    public function destroy(Request $request, Category $category): RedirectResponse
    {
        abort_unless($category->outlet_id === $request->user()->outlet_id, 403);

        if ($category->products()->exists()) {
            return redirect()->back()->with('error', 'Kategori tidak dapat dihapus karena masih digunakan oleh produk.');
        }

        $category->delete();

        return redirect()->back()->with('success', 'Kategori berhasil dihapus.');
    }
}
