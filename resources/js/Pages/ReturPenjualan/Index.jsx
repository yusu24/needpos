import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, CheckCircle, Search, Undo2, Calendar, Receipt } from 'lucide-react';
import debounce from 'lodash/debounce';

export default function Index({ customerReturns, filters }) {
  const [search, setSearch] = React.useState(filters.search || '');

  const debouncedSearch = React.useMemo(
    () =>
      debounce((value) => {
        router.get(
          route('admin.customer-returns.index'),
          { search: value },
          { preserveState: true, replace: true }
        );
      }, 300),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  const handleConfirm = (id) => {
    if (confirm('Apakah Anda yakin ingin mengkonfirmasi retur penjualan ini? Stok barang akan dikembalikan ke inventori.')) {
      router.post(route('admin.customer-returns.confirm', id));
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <AppLayout header="Retur Penjualan (Dari Pelanggan)">
      <Head title="Retur Penjualan" />

      <div className="flex flex-col gap-4">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Daftar Retur Konsumen</h2>
            <p className="text-xs text-slate-500 font-medium">Pengembalian / penukaran barang belanja oleh Pelanggan.</p>
          </div>

          <div className="flex w-full md:w-auto items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium"
                placeholder="Cari No. Retur / No. Invoice / Pelanggan..."
              />
            </div>

            <Link
              href={route('admin.customer-returns.create')}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3.5 rounded-lg text-xs shadow-md shadow-teal-600/10 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus size={14} />
              Buat Retur
            </Link>
          </div>
        </div>

        {/* List Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                  <th className="py-3 px-4">No. Retur</th>
                  <th className="py-3 px-4">No. Invoice Order</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Tanggal Buat</th>
                  <th className="py-3 px-4 text-center">Tipe Retur</th>
                  <th className="py-3 px-4 text-right">Nilai Retur</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                {customerReturns.data.length > 0 ? (
                  customerReturns.data.map((cr) => (
                    <tr key={cr.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                        <Undo2 size={14} className="text-teal-600" />
                        {cr.return_number}
                      </td>
                      <td className="py-3.5 px-4 font-semibold flex items-center gap-1">
                        <Receipt size={12} className="text-slate-400" />
                        {cr.order?.order_number}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{cr.customer?.name || 'Walk-in Customer'}</td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <span className="flex items-center gap-1 text-[10px]">
                          <Calendar size={10} className="text-slate-400" />
                          {new Date(cr.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          cr.type === 'refund'
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {cr.type === 'refund' ? 'Refund Uang' : 'Tukar Barang'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-right">{formatCurrency(cr.total_amount)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          cr.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {cr.status === 'confirmed' ? 'Selesai' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {cr.status === 'draft' && (
                            <button
                              onClick={() => handleConfirm(cr.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                            >
                              <CheckCircle size={10} />
                              Konfirmasi
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400">
                      Retur penjualan tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {customerReturns.links && customerReturns.links.length > 3 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-[10px] text-slate-500">
                Menampilkan {customerReturns.from}-{customerReturns.to} dari {customerReturns.total} retur
              </span>
              <div className="flex gap-1">
                {customerReturns.links.map((link, idx) => (
                  <button
                    key={idx}
                    disabled={!link.url}
                    onClick={() => router.get(link.url)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      link.active
                        ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/10'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    } disabled:opacity-50`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
