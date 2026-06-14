<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveSupplierRequest;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $outletId = $request->user()->outlet_id;
        $search = $request->input('search');
        $perPage = min((int) $request->input('per_page', 10), 100);

        $suppliers = Supplier::where('outlet_id', $outletId)
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('contact_person', 'like', "%{$search}%");
            })
            ->orderBy('name', 'asc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Supplier/Index', [
            'suppliers' => $suppliers,
            'filters' => ['search' => $search, 'per_page' => $perPage],
        ]);
    }

    public function create()
    {
        return Inertia::render('Supplier/Form');
    }

    public function store(SaveSupplierRequest $request)
    {
        $user = $request->user();

        Supplier::create([
            'outlet_id' => $user->outlet_id,
            'name' => $request->input('name'),
            'contact_person' => $request->input('contact_person'),
            'phone' => $request->input('phone'),
            'email' => $request->input('email'),
            'address' => $request->input('address'),
            'payment_terms' => $request->input('payment_terms'),
            'is_active' => $request->input('is_active', true),
        ]);

        return redirect()->route('admin.suppliers.index')->with('success', 'Supplier berhasil ditambahkan.');
    }

    public function edit(Request $request, Supplier $supplier)
    {
        if ($supplier->outlet_id !== $request->user()->outlet_id) {
            abort(403);
        }

        return Inertia::render('Supplier/Form', [
            'supplier' => $supplier,
        ]);
    }

    public function update(SaveSupplierRequest $request, Supplier $supplier)
    {
        if ($supplier->outlet_id !== $request->user()->outlet_id) {
            abort(403);
        }

        $supplier->update([
            'name' => $request->input('name'),
            'contact_person' => $request->input('contact_person'),
            'phone' => $request->input('phone'),
            'email' => $request->input('email'),
            'address' => $request->input('address'),
            'payment_terms' => $request->input('payment_terms'),
            'is_active' => $request->input('is_active', true),
        ]);

        return redirect()->route('admin.suppliers.index')->with('success', 'Supplier berhasil diperbarui.');
    }

    public function destroy(Request $request, Supplier $supplier)
    {
        if ($supplier->outlet_id !== $request->user()->outlet_id) {
            abort(403);
        }

        $supplier->delete();

        return redirect()->route('admin.suppliers.index')->with('success', 'Supplier berhasil dihapus.');
    }
}
