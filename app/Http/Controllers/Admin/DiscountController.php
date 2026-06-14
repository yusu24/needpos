<?php
// app/Http/Controllers/Admin/DiscountController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveDiscountRequest;
use App\Models\Discount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class DiscountController extends Controller
{
    /**
     * List all discounts.
     */
    public function index(Request $request): Response
    {
        $outletId = $request->user()->outlet_id;
        $perPage = min((int) $request->input('per_page', 15), 100);

        $discounts = Discount::forOutlet($outletId)
            ->when($request->search, fn ($q) =>
                $q->where(function ($inner) use ($request) {
                    $inner->where('code', 'like', "%{$request->search}%")
                          ->orWhere('name', 'like', "%{$request->search}%");
                })
            )
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Diskon/Index', [
            'discounts' => $discounts,
            'filters'   => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Show form to create new discount.
     */
    public function create(): Response
    {
        return Inertia::render('Diskon/Form');
    }

    /**
     * Store new discount.
     */
    public function store(SaveDiscountRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['outlet_id'] = $request->user()->outlet_id;

        Discount::create($data);

        return redirect()->route('admin.discounts.index')->with('success', 'Diskon berhasil dibuat.');
    }

    /**
     * Show form to edit existing discount.
     */
    public function edit(Request $request, Discount $discount): Response
    {
        abort_unless($discount->outlet_id === $request->user()->outlet_id, 403);

        return Inertia::render('Diskon/Form', [
            'discount' => $discount,
        ]);
    }

    /**
     * Update discount.
     */
    public function update(SaveDiscountRequest $request, Discount $discount): RedirectResponse
    {
        abort_unless($discount->outlet_id === $request->user()->outlet_id, 403);

        $discount->update($request->validated());

        return redirect()->route('admin.discounts.index')->with('success', 'Diskon berhasil diperbarui.');
    }

    /**
     * Delete discount.
     */
    public function destroy(Request $request, Discount $discount): RedirectResponse
    {
        abort_unless($discount->outlet_id === $request->user()->outlet_id, 403);

        $discount->delete();

        return redirect()->route('admin.discounts.index')->with('success', 'Diskon berhasil dihapus.');
    }
}
