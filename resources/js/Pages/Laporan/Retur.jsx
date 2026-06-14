import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, router } from '@inertiajs/react';
import { Undo2, ArrowUpRight, ArrowDownRight, Calendar, Receipt } from 'lucide-react';

export default function Retur({ summary, supplierReturns = [], customerReturns = [], filters }) {
  const [dateFrom, setDateFrom] = React.useState(filters.date_from || '');
  const [dateTo, setDateTo] = React.useState(filters.date_to || '');

  const handleFilter = (e) => {
    e.preventDefault();
    router.get(route('admin.reports.returns'), {
      date_from: dateFrom,
      date_to: dateTo,
    }, { preserveState: true });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <AppLayout header="Laporan Retur (Supplier & Penjualan)">
      <Head title="Laporan Retur" />

      <div className="flex flex-col gap-4">
        {/* Filter Bar */}
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

        {/* Aggregate Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Supplier Returns Summary */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex justify-between items-center shadow-sm">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Retur Ke Supplier</span>
              <span className="text-lg font-black text-slate-900 block mt-1">{formatCurrency(summary.supplier_returns_amount)}</span>
              <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">{summary.supplier_returns_count} Sesi Pengembalian</span>
            </div>
            <div className="p-2.5 bg-rose-50 rounded-lg text-rose-600">
              <ArrowUpRight size={20} />
            </div>
          </div>

          {/* Customer Returns Summary */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex justify-between items-center shadow-sm">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Retur Dari Pelanggan</span>
              <span className="text-lg font-black text-slate-900 block mt-1">{formatCurrency(summary.customer_returns_amount)}</span>
              <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">{summary.customer_returns_count} Sesi Pengembalian</span>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
              <ArrowDownRight size={20} />
            </div>
          </div>
        </div>

        {/* Tabs for Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Supplier Returns Logs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase">Retur Ke Supplier</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                    <th className="py-2.5 px-3">No. Retur</th>
                    <th className="py-2.5 px-3">Supplier</th>
                    <th className="py-2.5 px-3 text-right">Nilai Retur</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                  {supplierReturns.length > 0 ? (
                    supplierReturns.map((sr) => (
                      <tr key={sr.id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{sr.return_number}</td>
                        <td className="py-2.5 px-3 text-slate-600">{sr.supplier?.name}</td>
                        <td className="py-2.5 px-3 text-right font-bold">{formatCurrency(sr.total_amount)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            sr.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {sr.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400">
                        Belum ada retur ke supplier.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Customer Returns Logs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase">Retur Dari Pelanggan</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                    <th className="py-2.5 px-3">No. Retur</th>
                    <th className="py-2.5 px-3">Order</th>
                    <th className="py-2.5 px-3 text-right">Nilai Retur</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                  {customerReturns.length > 0 ? (
                    customerReturns.map((cr) => (
                      <tr key={cr.id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{cr.return_number}</td>
                        <td className="py-2.5 px-3 text-slate-600 flex items-center gap-1 font-mono text-[10px]">
                          <Receipt size={10} className="text-slate-400" />
                          {cr.order?.order_number}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold">{formatCurrency(cr.total_amount)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            cr.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {cr.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400">
                        Belum ada retur dari pelanggan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
