<?php
// app/Http/Controllers/Admin/ReportController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportService $reportService
    ) {}

    /**
     * Tampilkan halaman laporan utama.
     */
    public function index(Request $request): Response
    {
        $outletId = $request->user()->outlet_id;
        
        // Default date range: current month
        $dateFrom = $request->date_from ?: now()->startOfMonth()->toDateString();
        $dateTo = $request->date_to ?: now()->endOfDay()->toDateString();

        $summary = $this->reportService->getSummary($outletId, $dateFrom, $dateTo);
        $dailySales = $this->reportService->getDailySales($outletId, $dateFrom, $dateTo);
        $paymentStats = $this->reportService->getPaymentBreakdown($outletId, $dateFrom, $dateTo);
        $topProducts = $this->reportService->getTopProducts($outletId, $dateFrom, $dateTo, 5);

        return Inertia::render('Laporan/Index', [
            'summary'      => $summary,
            'dailySales'   => $dailySales,
            'paymentStats' => $paymentStats,
            'topProducts'  => $topProducts,
            'filters'      => [
                'date_from' => $dateFrom,
                'date_to'   => $dateTo,
            ],
        ]);
    }

    /**
     * Ekspor laporan ke PDF.
     */
    public function exportPdf(Request $request)
    {
        $user = $request->user();
        $outletId = $user->outlet_id;
        $outlet = $user->outlet;

        $dateFrom = $request->date_from ?: now()->startOfMonth()->toDateString();
        $dateTo = $request->date_to ?: now()->endOfDay()->toDateString();

        $summary = $this->reportService->getSummary($outletId, $dateFrom, $dateTo);
        $paymentStats = $this->reportService->getPaymentBreakdown($outletId, $dateFrom, $dateTo);
        $topProducts = $this->reportService->getTopProducts($outletId, $dateFrom, $dateTo, 10);

        $pdf = Pdf::loadView('reports.sales', [
            'summary'      => $summary,
            'paymentStats' => $paymentStats,
            'topProducts'  => $topProducts,
            'date_from'    => $dateFrom,
            'date_to'      => $dateTo,
            'outlet'       => $outlet,
            'user'         => $user,
        ]);

        return $pdf->download("laporan-penjualan-{$dateFrom}-ke-{$dateTo}.pdf");
    }

    /**
     * Tampilkan Laba Rugi detail.
     */
    public function profitLoss(Request $request)
    {
        $outletId = $request->user()->outlet_id;
        $dateFrom = $request->date_from ?: now()->startOfMonth()->toDateString();
        $dateTo = $request->date_to ?: now()->endOfDay()->toDateString();

        $data = $this->reportService->getProfitLossDetailed($outletId, $dateFrom, $dateTo);

        return Inertia::render('Laporan/LabaRugi', [
            'summary' => $data['summary'],
            'items' => $data['items'],
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    /**
     * Tampilkan Laporan Pembelian.
     */
    public function purchases(Request $request)
    {
        $outletId = $request->user()->outlet_id;
        $dateFrom = $request->date_from ?: now()->startOfMonth()->toDateString();
        $dateTo = $request->date_to ?: now()->endOfDay()->toDateString();

        $data = $this->reportService->getPurchasesReport($outletId, $dateFrom, $dateTo);

        return Inertia::render('Laporan/Pembelian', [
            'poStats' => $data['po_stats'],
            'receives' => $data['receives'],
            'totalSpent' => $data['total_spent'],
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    /**
     * Tampilkan Laporan Retur.
     */
    public function returns(Request $request)
    {
        $outletId = $request->user()->outlet_id;
        $dateFrom = $request->date_from ?: now()->startOfMonth()->toDateString();
        $dateTo = $request->date_to ?: now()->endOfDay()->toDateString();

        $data = $this->reportService->getReturnsReport($outletId, $dateFrom, $dateTo);

        return Inertia::render('Laporan/Retur', [
            'summary' => $data['summary'],
            'supplierReturns' => $data['supplier_returns'],
            'customerReturns' => $data['customer_returns'],
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
}
