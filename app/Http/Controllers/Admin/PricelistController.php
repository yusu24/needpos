<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SavePricelistRequest;
use App\Models\Pricelist;
use App\Models\PricelistItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PricelistController extends Controller
{
    public function index(Request $request)
    {
        $outletId = $request->user()->outlet_id;
        $perPage = min((int) $request->input('per_page', 10), 100);

        $pricelists = Pricelist::where('outlet_id', $outletId)
            ->withCount('items')
            ->orderBy('id', 'desc')
            ->paginate($perPage);

        return Inertia::render('Pricelist/Index', [
            'pricelists' => $pricelists,
            'filters' => ['per_page' => $perPage],
        ]);
    }

    public function create(Request $request)
    {
        $outletId = $request->user()->outlet_id;
        $products = Product::where('outlet_id', $outletId)->where('is_active', true)->get();

        return Inertia::render('Pricelist/Form', [
            'products' => $products,
        ]);
    }

    public function store(SavePricelistRequest $request)
    {
        $user = $request->user();

        DB::transaction(function () use ($request, $user) {
            $pricelist = Pricelist::create([
                'outlet_id' => $user->outlet_id,
                'name' => $request->input('name'),
                'type' => $request->input('type'),
            ]);

            foreach ($request->input('items') as $item) {
                PricelistItem::create([
                    'pricelist_id' => $pricelist->id,
                    'product_id' => $item['product_id'],
                    'price' => $item['price'],
                    'min_qty' => $item['min_qty'] ?? 0,
                ]);
            }
        });

        return redirect()->route('admin.pricelists.index')->with('success', 'Pricelist berhasil dibuat.');
    }

    public function edit(Request $request, Pricelist $pricelist)
    {
        $user = $request->user();
        if ($pricelist->outlet_id !== $user->outlet_id) {
            abort(403);
        }

        $products = Product::where('outlet_id', $user->outlet_id)->where('is_active', true)->get();
        $pricelist->load('items');

        return Inertia::render('Pricelist/Form', [
            'pricelist' => $pricelist,
            'products' => $products,
        ]);
    }

    public function update(SavePricelistRequest $request, Pricelist $pricelist)
    {
        $user = $request->user();
        if ($pricelist->outlet_id !== $user->outlet_id) {
            abort(403);
        }

        DB::transaction(function () use ($request, $pricelist) {
            $pricelist->update([
                'name' => $request->input('name'),
                'type' => $request->input('type'),
            ]);

            // Delete old items and recreate
            $pricelist->items()->delete();

            foreach ($request->input('items') as $item) {
                PricelistItem::create([
                    'pricelist_id' => $pricelist->id,
                    'product_id' => $item['product_id'],
                    'price' => $item['price'],
                    'min_qty' => $item['min_qty'] ?? 0,
                ]);
            }
        });

        return redirect()->route('admin.pricelists.index')->with('success', 'Pricelist berhasil diperbarui.');
    }

    public function destroy(Request $request, Pricelist $pricelist)
    {
        if ($pricelist->outlet_id !== $request->user()->outlet_id) {
            abort(403);
        }

        $pricelist->delete();

        return redirect()->route('admin.pricelists.index')->with('success', 'Pricelist berhasil dihapus.');
    }
}
