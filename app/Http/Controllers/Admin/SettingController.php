<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveSettingRequest;
use App\Models\Outlet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index(Request $request)
    {
        $outletId = $request->user()->outlet_id;
        $outlet = Outlet::findOrFail($outletId);

        return Inertia::render('Pengaturan/Index', [
            'outlet' => $outlet,
        ]);
    }

    public function update(SaveSettingRequest $request)
    {
        $user = $request->user();
        $outlet = Outlet::findOrFail($user->outlet_id);

        $data = $request->validated();

        if ($request->hasFile('logo_file')) {
            // Delete old logo if exists
            if ($outlet->logo && Storage::disk('public')->exists($outlet->logo)) {
                Storage::disk('public')->delete($outlet->logo);
            }

            $path = $request->file('logo_file')->store('logos', 'public');
            $data['logo'] = $path;
        }

        $outlet->update([
            'name' => $data['name'],
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'tax_rate' => $data['tax_rate'],
            'receipt_footer' => $data['receipt_footer'] ?? null,
            'points_ratio' => $data['points_ratio'] ?? 10000,
            'logo' => $data['logo'] ?? $outlet->logo,
        ]);

        return redirect()->route('admin.settings.index')->with('success', 'Pengaturan outlet berhasil diperbarui.');
    }
}
