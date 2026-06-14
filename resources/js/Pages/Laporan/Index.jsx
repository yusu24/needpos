import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, router } from '@inertiajs/react';
import { Calendar, Download, TrendingUp, DollarSign, ShoppingBag, Percent, Receipt, BarChart3, Star, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Index({ summary, dailySales, paymentStats, topProducts, filters }) {
  const [dateFrom, setDateFrom] = React.useState(filters.date_from || '');
  const [dateTo, setDateTo] = React.useState(filters.date_to || '');

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    router.get(route('admin.reports.index'), {
      date_from: dateFrom,
      date_to: dateTo
    }, {
      preserveState: true
    });
  };

  const handleDownloadPdf = () => {
    window.location.href = route('admin.reports.pdf', {
      date_from: dateFrom,
      date_to: dateTo
    });
  };

  // Format chart ticks
  const chartData = dailySales.map(day => ({
    ...day,
    name: new Date(day.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    total: parseFloat(day.revenue)
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 shadow-xl text-xs font-semibold">
          <p className="text-slate-400 mb-1">{payload[0].payload.date}</p>
          <p className="text-indigo-400">Revenue: {formatCurrency(payload[0].value)}</p>
          <p className="text-slate-300">Transaksi: {payload[0].payload.orders_count}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <AppLayout header="Laporan Analisis Penjualan">
      <Head title="Laporan Penjualan" />

      {/* Date Range Selection & Export Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 bg-white p-5 border border-slate-200/80 rounded-3xl shadow-sm">
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-3 flex-1">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Dari Tanggal</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sampai Tanggal</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-indigo-600/10 active:scale-[0.99] transition-all cursor-pointer h-10 flex items-center justify-center gap-1.5"
          >
            <Calendar size={14} />
            Terapkan Filter
          </button>
        </form>

        <button
          onClick={handleDownloadPdf}
          className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-5 rounded-2xl text-xs shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 cursor-pointer self-start lg:self-auto h-12"
        >
          <Download size={14} />
          Unduh Laporan PDF
        </button>
      </div>

      {/* Summary Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {/* Total revenue */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/50 shrink-0">
            <DollarSign size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pendapatan Kotor</span>
            <h4 className="text-lg font-black text-slate-900 mt-0.5">{formatCurrency(summary.total_revenue)}</h4>
          </div>
        </div>

        {/* Profit */}
        <div className="bg-emerald-500/5 rounded-3xl p-5 border border-emerald-500/20 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] text-emerald-600/90 uppercase font-bold tracking-wider">Laba Bersih</span>
            <h4 className="text-lg font-black text-emerald-800 mt-0.5">{formatCurrency(summary.profit)}</h4>
          </div>
        </div>

        {/* Total orders */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/50 shrink-0">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Transaksi</span>
            <h4 className="text-lg font-black text-slate-900 mt-0.5">{summary.total_orders} Order</h4>
          </div>
        </div>

        {/* Avg order value */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100/50 shrink-0">
            <Receipt size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Rerata Keranjang</span>
            <h4 className="text-lg font-black text-slate-900 mt-0.5">{formatCurrency(summary.avg_order_value)}</h4>
          </div>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total HPP (COGS)</span>
          <p className="text-sm font-bold text-slate-700 mt-1">{formatCurrency(summary.cogs)}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Diskon Diberikan</span>
          <p className="text-sm font-bold text-rose-600 mt-1">-{formatCurrency(summary.total_discount)}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pajak (PPN) Terkumpul</span>
          <p className="text-sm font-bold text-indigo-600 mt-1">+{formatCurrency(summary.total_tax)}</p>
        </div>
      </div>

      {/* Sales trends charts Recharts */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm mb-6">
        <h3 className="font-bold text-slate-800 text-sm mb-6 flex items-center gap-2">
          <BarChart3 size={16} className="text-indigo-600" />
          Tren Grafik Penjualan Harian
        </h3>
        
        <div className="w-full h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp ${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              Belum ada data transaksi pada periode ini untuk ditampilkan di grafik.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment stats breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm overflow-hidden">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <Wallet size={16} className="text-indigo-600" />
            Metode Pembayaran Terpopuler
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[9px] font-bold tracking-wider uppercase">
                  <th className="pb-3">Metode</th>
                  <th className="pb-3 text-center">Frekuensi</th>
                  <th className="pb-3 text-right">Total Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600 text-xs font-semibold">
                {paymentStats.length > 0 ? (
                  paymentStats.map((stat, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 capitalize">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold uppercase text-[9px]">
                          {stat.payment_method}
                        </span>
                      </td>
                      <td className="py-3 text-center font-bold text-slate-800">{stat.count}x</td>
                      <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(stat.revenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-6 text-center text-slate-400 text-xs">Tidak ada data.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top selling products table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm overflow-hidden">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <Star size={16} className="text-indigo-600" />
            Produk Terlaris (Top Selling)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[9px] font-bold tracking-wider uppercase">
                  <th className="pb-3">Nama Produk</th>
                  <th className="pb-3 text-center">Kuantitas Terjual</th>
                  <th className="pb-3 text-right">Nilai Penjualan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600 text-xs font-semibold">
                {topProducts.length > 0 ? (
                  topProducts.map((prod, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3">
                        <span className="font-bold text-slate-950">{prod.product_name}</span>
                      </td>
                      <td className="py-3 text-center font-bold text-slate-800">{Math.round(prod.quantity_sold)}x</td>
                      <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(prod.total_revenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-6 text-center text-slate-400 text-xs">Tidak ada data.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
