import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Eye, CheckCircle, Search, Calendar, FileText } from 'lucide-react';
import debounce from 'lodash/debounce';

export default function Index({ purchaseOrders, filters }) {
  const [search, setSearch] = React.useState(filters.search || '');

  const debouncedSearch = React.useMemo(
    () =>
      debounce((value) => {
        router.get(
          route('admin.purchase-orders.index'),
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

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-slate-100 text-slate-600 border border-slate-200',
      sent: 'bg-blue-50 text-blue-600 border border-blue-100',
      partial: 'bg-amber-50 text-amber-600 border border-amber-100',
      received: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      cancelled: 'bg-rose-50 text-rose-600 border border-rose-100',
    };
    const labels = {
      draft: 'Draft',
      sent: 'Dikirim',
      partial: 'Diterima Sebagian',
      received: 'Diterima Lengkap',
      cancelled: 'Dibatalkan',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${badges[status] || 'bg-slate-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <AppLayout header="Purchase Order (PO)">
      <Head title="Purchase Order" />

      <div className="flex flex-col gap-4">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Daftar Purchase Order</h2>
            <p className="text-xs text-slate-500 font-medium">Buat dan kelola pesanan pembelian barang dagangan ke Supplier.</p>
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
                placeholder="Cari No. PO / Supplier..."
              />
            </div>

            <Link
              href={route('admin.purchase-orders.create')}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3.5 rounded-lg text-xs shadow-md shadow-teal-600/10 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus size={14} />
              Buat PO
            </Link>
          </div>
        </div>

        {/* PO List Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                  <th className="py-3 px-4">No. PO</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Pembuat</th>
                  <th className="py-3 px-4">Est. Kedatangan</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                {purchaseOrders.data.length > 0 ? (
                  purchaseOrders.data.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                        <FileText size={14} className="text-teal-600" />
                        {po.po_number}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">{po.supplier?.name}</td>
                      <td className="py-3.5 px-4 text-slate-500">{po.user?.name}</td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <span className="flex items-center gap-1 text-[10px]">
                          <Calendar size={10} className="text-slate-400" />
                          {po.expected_at ? new Date(po.expected_at).toLocaleDateString('id-ID') : '-'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(po.total_amount)}</td>
                      <td className="py-3.5 px-4">{getStatusBadge(po.status)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link
                            href={route('admin.purchase-orders.show', po.id)}
                            className="p-1.5 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                            title="Detail"
                          >
                            <Eye size={12} />
                            Detail
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      Purchase Order tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {purchaseOrders.links && purchaseOrders.links.length > 3 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-[10px] text-slate-500">
                Menampilkan {purchaseOrders.from}-{purchaseOrders.to} dari {purchaseOrders.total} Purchase Order
              </span>
              <div className="flex gap-1">
                {purchaseOrders.links.map((link, idx) => (
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
