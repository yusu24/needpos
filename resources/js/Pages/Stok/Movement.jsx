import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, ArrowLeft, SlidersHorizontal, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import Pagination from '@/Components/Pagination';

export default function Movement({ movements, filters }) {
  const [search, setSearch] = React.useState(filters.search || '');
  const [type, setType] = React.useState(filters.type || '');
  const [dateFrom, setDateFrom] = React.useState(filters.date_from || '');
  const [dateTo, setDateTo] = React.useState(filters.date_to || '');

  // Debounced search
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleFilterChange();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleFilterChange = (movType = type, fromDate = dateFrom, toDate = dateTo) => {
    router.get(route('admin.stock.movements'), {
      search: search,
      type: movType,
      date_from: fromDate,
      date_to: toDate,
      per_page: filters.per_page || 25
    }, {
      preserveState: true,
      replace: true
    });
  };

  const handleTypeSelect = (e) => {
    const val = e.target.value;
    setType(val);
    handleFilterChange(val, dateFrom, dateTo);
  };

  const handleDateChange = (field, val) => {
    if (field === 'from') {
      setDateFrom(val);
      handleFilterChange(type, val, dateTo);
    } else {
      setDateTo(val);
      handleFilterChange(type, dateFrom, val);
    }
  };

  const getMovementBadge = (type) => {
    switch (type) {
      case 'in':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">
            Masuk
          </span>
        );
      case 'out':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-wide">
            Keluar
          </span>
        );
      case 'adjustment':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wide">
            Penyesuaian
          </span>
        );
      case 'void':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
            Void
          </span>
        );
      default:
        return <span className="text-slate-500 uppercase">{type}</span>;
    }
  };

  return (
    <AppLayout header="Riwayat Mutasi Stok">
      <Head title="Riwayat Mutasi Stok" />

      {/* Back link */}
      <Link
        href={route('admin.stock.index')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-4 cursor-pointer"
      >
        <ArrowLeft size={14} />
        Kembali ke Persediaan Stok
      </Link>

      {/* Filter toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pencarian</label>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                placeholder="Cari berdasarkan produk atau catatan..."
              />
            </div>
          </div>

          {/* Type dropdown */}
          <div className="w-full lg:w-44">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tipe Mutasi</label>
            <select
              value={type}
              onChange={handleTypeSelect}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="">Semua Tipe</option>
              <option value="in">Masuk (Restock)</option>
              <option value="out">Keluar (Penjualan)</option>
              <option value="adjustment">Penyesuaian (Opname)</option>
              <option value="void">Void Transaksi</option>
            </select>
          </div>

          {/* Date range */}
          <div className="w-full lg:w-96 flex gap-3">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Dari Tanggal</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => handleDateChange('from', e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sampai Tanggal</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => handleDateChange('to', e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                <th className="py-4 px-5">Tanggal</th>
                <th className="py-4 px-4">Produk</th>
                <th className="py-4 px-4 text-center">Tipe</th>
                <th className="py-4 px-4 text-right">Kuantitas</th>
                <th className="py-4 px-4 text-right">Sebelum</th>
                <th className="py-4 px-4 text-right">Sesudah</th>
                <th className="py-4 px-4">Keterangan / Catatan</th>
                <th className="py-4 px-5">Diproses Oleh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
              {movements.data.length > 0 ? (
                movements.data.map(mov => (
                  <tr key={mov.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Timestamp */}
                    <td className="py-4 px-5 text-slate-500 text-[10px] font-mono">
                      {formatDate(mov.created_at, true)}
                    </td>

                    {/* Product */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900">{mov.product_name}</div>
                      {mov.product_sku && (
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">SKU: {mov.product_sku}</div>
                      )}
                    </td>

                    {/* Movement Type */}
                    <td className="py-4 px-4 text-center">
                      {getMovementBadge(mov.type)}
                    </td>

                    {/* Quantity */}
                    <td className={`py-4 px-4 text-right font-bold text-sm ${
                      mov.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {mov.quantity > 0 ? `+${Math.round(mov.quantity)}` : Math.round(mov.quantity)}
                    </td>

                    {/* Stock Before */}
                    <td className="py-4 px-4 text-right text-slate-400 font-mono">
                      {Math.round(mov.quantity_before)}
                    </td>

                    {/* Stock After */}
                    <td className="py-4 px-4 text-right text-slate-800 font-bold font-mono">
                      {Math.round(mov.quantity_after)}
                    </td>

                    {/* Notes */}
                    <td className="py-4 px-4 text-slate-600 leading-normal max-w-[200px] truncate" title={mov.note}>
                      {mov.note || <span className="text-slate-400 italic">-</span>}
                    </td>

                    {/* User */}
                    <td className="py-4 px-5 text-slate-600 font-semibold">
                      {mov.user_name}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    Tidak ada riwayat mutasi stok ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          paginator={movements}
          filters={filters}
          routeName="admin.stock.movements"
          entityName="mutasi"
          color="indigo"
        />
      </div>
    </AppLayout>
  );
}
