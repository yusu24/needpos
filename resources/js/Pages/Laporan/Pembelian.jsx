import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, router } from '@inertiajs/react';
import { Search, Calendar, FileText, Truck, DollarSign } from 'lucide-react';

export default function Pembelian({ poStats = [], receives = [], totalSpent, filters }) {
  const [dateFrom, setDateFrom] = React.useState(filters.date_from || '');
  const [dateTo, setDateTo] = React.useState(filters.date_to || '');

  const handleFilter = (e) => {
    e.preventDefault();
    router.get(route('admin.reports.purchases'), {
      date_from: dateFrom,
      date_to: dateTo,
    }, { preserveState: true });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const getPoCount = (status) => {
    const stat = poStats.find(s => s.status === status);
    return stat ? parseInt(stat.count) : 0;
  };

  return (
    <AppLayout header="Laporan Pembelian & Restock PO">
      <Head title="Laporan Pembelian" />

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

        {/* Purchase Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex justify-between items-center shadow-sm">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Pengeluaran Pembelian</span>
              <span className="text-base font-black text-slate-900 block mt-1">{formatCurrency(totalSpent)}</span>
            </div>
            <div className="p-2.5 bg-teal-50 rounded-lg text-teal-600">
              <DollarSign size={16} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex justify-between items-center shadow-sm">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Total PO Baru (Draft)</span>
              <span className="text-base font-black text-slate-950 block mt-1">{getPoCount('draft')} PO</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg text-slate-400">
              <FileText size={16} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex justify-between items-center shadow-sm">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">PO Dikirim / Proses</span>
              <span className="text-base font-black text-slate-950 block mt-1">{getPoCount('sent') + getPoCount('partial')} PO</span>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg text-blue-500">
              <Truck size={16} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex justify-between items-center shadow-sm">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Selesai Diterima</span>
              <span className="text-base font-black text-slate-950 block mt-1">{getPoCount('received')} PO</span>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
              <Truck size={16} />
            </div>
          </div>
        </div>

        {/* Detailed Receives Log Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase">Log Penerimaan Barang Aktual</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                  <th className="py-2.5 px-4">No. Penerimaan</th>
                  <th className="py-2.5 px-4">No. PO Referensi</th>
                  <th className="py-2.5 px-4">Supplier</th>
                  <th className="py-2.5 px-4">Tanggal Masuk</th>
                  <th className="py-2.5 px-4">Penerima</th>
                  <th className="py-2.5 px-4">Catatan Surat Jalan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                {receives.length > 0 ? (
                  receives.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{rec.receive_number}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{rec.purchase_order?.po_number || '-'}</td>
                      <td className="py-3 px-4 font-semibold text-slate-600">{rec.purchase_order?.supplier?.name || '-'}</td>
                      <td className="py-3 px-4 text-slate-500">
                        <span className="flex items-center gap-1 text-[10px]">
                          <Calendar size={10} className="text-slate-400" />
                          {new Date(rec.received_at).toLocaleDateString('id-ID')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{rec.user?.name}</td>
                      <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate">{rec.note || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      Belum ada pencatatan penerimaan barang masuk pada rentang tanggal terpilih.
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
