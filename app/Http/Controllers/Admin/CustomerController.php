<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveCustomerRequest;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $outletId = $request->user()->outlet_id;
        $search = $request->input('search');
        $perPage = min((int) $request->input('per_page', 10), 100);

        $customers = Customer::where('outlet_id', $outletId)
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy('name', 'asc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Pelanggan/Index', [
            'customers' => $customers,
            'filters' => ['search' => $search, 'per_page' => $perPage],
        ]);
    }

    public function create()
    {
        return Inertia::render('Pelanggan/Form');
    }

    public function store(SaveCustomerRequest $request)
    {
        $user = $request->user();

        Customer::create([
            'outlet_id' => $user->outlet_id,
            'name' => $request->input('name'),
            'phone' => $request->input('phone'),
            'email' => $request->input('email'),
            'address' => $request->input('address'),
            'tier' => $request->input('tier', 'regular'),
            'points' => 0,
            'total_spent' => 0,
            'joined_at' => now(),
        ]);

        return redirect()->route('admin.customers.index')->with('success', 'Pelanggan berhasil didaftarkan.');
    }

    public function edit(Request $request, Customer $customer)
    {
        if ($customer->outlet_id !== $request->user()->outlet_id) {
            abort(403);
        }

        return Inertia::render('Pelanggan/Form', [
            'customer' => $customer,
        ]);
    }

    public function update(SaveCustomerRequest $request, Customer $customer)
    {
        if ($customer->outlet_id !== $request->user()->outlet_id) {
            abort(403);
        }

        $customer->update([
            'name' => $request->input('name'),
            'phone' => $request->input('phone'),
            'email' => $request->input('email'),
            'address' => $request->input('address'),
            'tier' => $request->input('tier', $customer->tier),
        ]);

        return redirect()->route('admin.customers.index')->with('success', 'Data pelanggan berhasil diperbarui.');
    }

    public function show(Request $request, Customer $customer)
    {
        if ($customer->outlet_id !== $request->user()->outlet_id) {
            abort(403);
        }

        $customer->load(['orders' => function ($q) {
            $q->orderBy('id', 'desc')->limit(10);
        }]);

        return Inertia::render('Pelanggan/Show', [
            'customer' => $customer,
        ]);
    }

    public function destroy(Request $request, Customer $customer)
    {
        if ($customer->outlet_id !== $request->user()->outlet_id) {
            abort(403);
        }

        $customer->delete();

        return redirect()->route('admin.customers.index')->with('success', 'Data pelanggan berhasil dihapus.');
    }
}
