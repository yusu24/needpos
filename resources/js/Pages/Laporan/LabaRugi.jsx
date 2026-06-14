import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, router } from '@inertiajs/react';
import { Calendar, DollarSign, ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function LabaRugi({ summary, items, filters }) {
  const [dateFrom, setDateFrom] = React.useState(filters.date_from || '');
  const [dateTo, setDateTo] = React.useState(filters.date_to || '');

  const handleFilter = (e) => {
    e.preventDefault();
    router.get(route('admin.reports.profit-loss'), {
      date_from: dateFrom,
      date_to: dateTo,
    }, { preserveState: true });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const grossProfit = parseFloat(summary.total_revenue) - parseFloat(summary.cogs);
  const profitMargin = summary.total_revenue > 0 ? (grossProfit / parseFloat(summary.total_revenue)) * 100 : 0;

  return (
    <AppLayout header="Laporan Laba Rugi (Profit & Loss)">
      <Head title="Laba Rugi" />

      <div className="flex flex-col gap-4">
        {/* Date Filter Bar */}
        <form onSubmit={handleFilter} className="flex flex-wrap gap-3 items-end bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tanggal Selesai</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-lg text-xs shadow-md shadow-teal-600/10 cursor-pointer transition-colors"
          >
            Filter Laporan
          </button>
        </form>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Revenue */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex justify-between items-center shadow-sm">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Pendapatan Kotor</span>
              <span className="text-lg font-black text-slate-900 block mt-1">{formatCurrency(summary.total_revenue)}</span>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
              <ArrowUpRight size={20} />
            </div>
          </div>

          {/* COGS (HPP) */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex justify-between items-center shadow-sm">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Harga Pokok Penjualan (HPP)</span>
              <span className="text-lg font-black text-slate-900 block mt-1">{formatCurrency(summary.cogs)}</span>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600">
              <ArrowDownRight size={20} />
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-teal-900 text-white rounded-xl border border-teal-800 p-4 flex justify-between items-center shadow-md shadow-teal-950/20">
            <div>
              <span className="block text-[10px] font-bold text-teal-300 uppercase">Laba Bersih Estimasi</span>
              <span className="text-lg font-black block mt-1">{formatCurrency(grossProfit)}</span>
              <span className="text-[10px] text-teal-300 block mt-0.5">Margin Laba: {profitMargin.toFixed(1)}%</span>
            </div>
            <div className="p-2.5 bg-teal-800 rounded-lg text-teal-200">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase">Analisa Margin Per Item</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                  <th className="py-2.5 px-4">Nama Produk</th>
                  <th className="py-2.5 px-4 text-center">Kuantitas Terjual</th>
                  <th className="py-2.5 px-4 text-right">Nilai Penjualan</th>
                  <th className="py-2.5 px-4 text-right">Total HPP</th>
                  <th className="py-2.5 px-4 text-right">Total Laba</th>
                  <th className="py-2.5 px-4 text-center">Margin Kontribusi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                {items.length > 0 ? (
                  items.map((item, index) => {
                    const margin = item.sales_amount > 0 ? (parseFloat(item.profit_amount) / parseFloat(item.sales_amount)) * 100 : 0;
                    return (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">{item.product_name}</td>
                        <td className="py-3 px-4 text-center text-slate-500">{parseFloat(item.quantity_sold)} pcs</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(item.sales_amount)}</td>
                        <td className="py-3 px-4 text-right text-amber-600 font-mono text-[11px]">{formatCurrency(item.cogs_amount)}</td>
                        <td className="py-3 px-4 text-right text-emerald-600 font-bold">{formatCurrency(item.profit_amount)}</td>
                        <td className="py-3 px-4 text-center font-bold">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                            margin >= 30
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : margin >= 15
                              ? 'bg-blue-50 text-blue-600 border border-blue-100'
                              : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            {margin.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      Belum ada pencatatan transaksi penjualan pada rentang tanggal terpilih.
                    </td>
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
