<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\FinalizeStockOpnameRequest;
use App\Http\Requests\Admin\StartStockOpnameRequest;
use App\Models\StockOpname;
use App\Services\StockOpnameService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockOpnameController extends Controller
{
    protected StockOpnameService $opnameService;

    public function __construct(StockOpnameService $opnameService)
    {
        $this->opnameService = $opnameService;
    }

    public function index(Request $request)
    {
        $outletId = $request->user()->outlet_id;

        $opnames = StockOpname::where('outlet_id', $outletId)
            ->with(['user'])
            ->orderBy('id', 'desc')
            ->paginate(10);

        // check if there is a draft opname
        $draftOpname = StockOpname::where('outlet_id', $outletId)
            ->where('status', 'draft')
            ->first();

        return Inertia::render('Opname/Index', [
            'opnames' => $opnames,
            'draftOpname' => $draftOpname,
        ]);
    }

    public function store(StartStockOpnameRequest $request)
    {
        try {
            $user = $request->user();
            $opname = $this->opnameService->start($request->validated(), $user);

            return redirect()->route('admin.stock-opnames.show', $opname->id)
                ->with('success', 'Sesi stock opname baru berhasil dimulai.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function show(Request $request, StockOpname $stockOpname)
    {
        if ($stockOpname->outlet_id !== $request->user()->outlet_id) {
            abort(403);
        }

        $stockOpname->load(['user', 'items.product']);

        return Inertia::render('Opname/Show', [
            'opname' => $stockOpname,
        ]);
    }

    public function finalize(FinalizeStockOpnameRequest $request, StockOpname $stockOpname)
    {
        if ($stockOpname->outlet_id !== $request->user()->outlet_id) {
            abort(403);
        }

        try {
            $user = $request->user();
            $this->opnameService->finalize($stockOpname, $request->input('items'), $user);

            return redirect()->route('admin.stock-opnames.index')
                ->with('success', 'Stock opname berhasil difinalisasi.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy(Request $request, StockOpname $stockOpname)
    {
        if ($stockOpname->outlet_id !== $request->user()->outlet_id) {
            abort(403);
        }

        // Rule 19: Opname yang sudah finalized tidak dapat diedit atau dibatalkan.
        if ($stockOpname->status === 'finalized') {
            return back()->withErrors(['error' => 'Stock opname yang sudah difinalisasi tidak dapat dibatalkan.']);
        }

        $stockOpname->delete();

        return redirect()->route('admin.stock-opnames.index')
            ->with('success', 'Stock opname berhasil dibatalkan/dihapus.');
    }
}
