<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Penjualan</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11.5px;
            color: #1e293b;
            margin: 0;
            padding: 0;
            line-height: 1.5;
        }
        .header {
            margin-bottom: 25px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 15px;
        }
        .header-title {
            font-size: 20px;
            font-weight: bold;
            color: #0f172a;
            margin: 0 0 5px 0;
        }
        .header-meta {
            color: #64748b;
            font-size: 10px;
        }
        .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #334155;
            margin: 25px 0 10px 0;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
        }
        .grid {
            width: 100%;
            margin-bottom: 20px;
        }
        .grid td {
            vertical-align: top;
        }
        .card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 10px;
        }
        .card-label {
            font-size: 9px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: bold;
            margin-bottom: 4px;
        }
        .card-value {
            font-size: 16px;
            font-weight: bold;
            color: #0f172a;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table.data-table th, table.data-table td {
            padding: 8px 10px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        table.data-table th {
            background-color: #f1f5f9;
            color: #475569;
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
        }
        table.data-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }
        .text-right {
            text-align: right !important;
        }
        .text-center {
            text-align: center !important;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            font-size: 9px;
            font-weight: bold;
            border-radius: 4px;
            background-color: #e2e8f0;
            color: #475569;
        }
    </style>
</head>
<body>

    <div class="header">
        <table style="width: 100%;">
            <tr>
                <td>
                    <h1 class="header-title">{{ $outlet->name }}</h1>
                    <div class="header-meta">
                        {{ $outlet->address }}<br>
                        Telp: {{ $outlet->phone ?: '-' }}
                    </div>
                </td>
                <td class="text-right" style="vertical-align: bottom;">
                    <div style="font-size: 14px; font-weight: bold; color: #4f46e5;">LAPORAN PENJUALAN</div>
                    <div class="header-meta">
                        Periode: {{ date('d M Y', strtotime($date_from)) }} s/d {{ date('d M Y', strtotime($date_to)) }}
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <div class="section-title">Ringkasan Penjualan</div>
    <table class="grid">
        <tr>
            <td style="width: 32%; padding-right: 1.3%;">
                <div class="card">
                    <div class="card-label">Total Transaksi</div>
                    <div class="card-value">{{ number_format($summary['total_orders']) }}</div>
                </div>
            </td>
            <td style="width: 32%; padding-right: 1.3%;">
                <div class="card">
                    <div class="card-label">Pendapatan Kotor</div>
                    <div class="card-value">Rp {{ number_format($summary['total_revenue'], 0, ',', '.') }}</div>
                </div>
            </td>
            <td style="width: 32%;">
                <div class="card" style="background-color: #ecfdf5; border-color: #a7f3d0;">
                    <div class="card-label" style="color: #047857;">Laba Bersih</div>
                    <div class="card-value" style="color: #065f46;">Rp {{ number_format($summary['profit'], 0, ',', '.') }}</div>
                </div>
            </td>
        </tr>
        <tr>
            <td style="width: 32%; padding-right: 1.3%;">
                <div class="card">
                    <div class="card-label">Rata-rata Keranjang</div>
                    <div class="card-value">Rp {{ number_format($summary['avg_order_value'], 0, ',', '.') }}</div>
                </div>
            </td>
            <td style="width: 32%; padding-right: 1.3%;">
                <div class="card">
                    <div class="card-label">Total HPP (COGS)</div>
                    <div class="card-value">Rp {{ number_format($summary['cogs'], 0, ',', '.') }}</div>
                </div>
            </td>
            <td style="width: 32%;">
                <div class="card">
                    <div class="card-label">Total Diskon & Pajak</div>
                    <div class="card-value">
                        <span style="font-size: 10px; color: #64748b;">Disc:</span> Rp {{ number_format($summary['total_discount'], 0, ',', '.') }} <br>
                        <span style="font-size: 10px; color: #64748b;">Tax:</span> Rp {{ number_format($summary['total_tax'], 0, ',', '.') }}
                    </div>
                </div>
            </td>
        </tr>
    </table>

    <table style="width: 100%; margin-top: 15px;">
        <tr>
            <!-- Left col: Payment Stats -->
            <td style="width: 48%; padding-right: 4%; vertical-align: top;">
                <div class="section-title" style="margin-top: 0;">Metode Pembayaran</div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Metode</th>
                            <th class="text-center">Jumlah</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($paymentStats as $stat)
                            <tr>
                                <td style="text-transform: uppercase;"><span class="badge">{{ $stat['payment_method'] }}</span></td>
                                <td class="text-center">{{ number_format($stat['count']) }}</td>
                                <td class="text-right">Rp {{ number_format($stat['revenue'], 0, ',', '.') }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="3" class="text-center text-muted">Tidak ada data.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </td>

            <!-- Right col: Top Products -->
            <td style="width: 48%; vertical-align: top;">
                <div class="section-title" style="margin-top: 0;">Produk Terlaris</div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Produk</th>
                            <th class="text-center">Qty</th>
                            <th class="text-right">Pendapatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($topProducts as $prod)
                            <tr>
                                <td><strong>{{ $prod['product_name'] }}</strong></td>
                                <td class="text-center">{{ number_format($prod['quantity_sold']) }}</td>
                                <td class="text-right">Rp {{ number_format($prod['total_revenue'], 0, ',', '.') }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="3" class="text-center text-muted">Tidak ada data.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </td>
        </tr>
    </table>

    <div style="margin-top: 50px; text-align: right; color: #64748b; font-size: 9px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
        Laporan ini diekspor oleh <strong>{{ $user->name }}</strong> pada {{ date('d-m-Y H:i:s') }}
    </div>

</body>
</html>
