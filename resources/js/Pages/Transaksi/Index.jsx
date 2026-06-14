import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Eye, AlertTriangle, FileText, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function Index({ orders, filters }) {
  const [search, setSearch] = React.useState(filters.search || '');
  const [status, setStatus] = React.useState(filters.status || '');
  const [paymentMethod, setPaymentMethod] = React.useState(filters.payment_method || '');
  const [dateFrom, setDateFrom] = React.useState(filters.date_from || '');
  const [dateTo, setDateTo] = React.useState(filters.date_to || '');

  // Debounced search
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleFilterChange();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleFilterChange = (stat = status, pay = paymentMethod, fromDate = dateFrom, toDate = dateTo) => {
    router.get(route('admin.orders.index'), {
      search: search,
      status: stat,
      payment_method: pay,
      date_from: fromDate,
      date_to: toDate
    }, {
      preserveState: true,
      replace: true
    });
  };

  const handleSelectFilter = (field, val) => {
    if (field === 'status') {
      setStatus(val);
      handleFilterChange(val, paymentMethod, dateFrom, dateTo);
    } else if (field === 'payment_method') {
      setPaymentMethod(val);
      handleFilterChange(status, val, dateFrom, dateTo);
    }
  };

  const handleDateChange = (field, val) => {
    if (field === 'from') {
      setDateFrom(val);
      handleFilterChange(status, paymentMethod, val, dateTo);
    } else {
      setDateTo(val);
      handleFilterChange(status, paymentMethod, dateFrom, val);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">
            Berhasil
          </span>
        );
      case 'voided':
        return (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-wide">
            <AlertTriangle size={8} />
            Void
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wide">
            {status}
          </span>
        );
    }
  };

  return (
    <AppLayout header="Riwayat Transaksi Penjualan">
      <Head title="Riwayat Transaksi" />

      {/* Advanced filters */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm mb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Search order_number */}
          <div className="relative w-full lg:col-span-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">No. Transaksi</label>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono font-bold"
                placeholder="Cari TRX-..."
              />
            </div>
          </div>

          {/* Status */}
          <div className="w-full">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status Order</label>
            <select
              value={status}
              onChange={e => handleSelectFilter('status', e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="paid">Berhasil / Lunas</option>
              <option value="voided">Void (Dibatalkan)</option>
            </select>
          </div>

          {/* Payment Method */}
          <div className="w-full">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Metode Bayar</label>
            <select
              value={paymentMethod}
              onChange={e => handleSelectFilter('payment_method', e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer uppercase"
            >
              <option value="">Semua Metode</option>
              <option value="cash">Tunai (Cash)</option>
              <option value="qris">QRIS</option>
              <option value="card">Kartu Debet/Kredit</option>
              <option value="transfer">Transfer Bank</option>
            </select>
          </div>

          {/* Date range from/to */}
          <div className="w-full lg:col-span-2 flex gap-3">
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

      {/* Orders Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                <th className="py-4 px-5">Nomor Order</th>
                <th className="py-4 px-4">Tanggal & Waktu</th>
                <th className="py-4 px-4">Kasir</th>
                <th className="py-4 px-4 text-center">Metode Bayar</th>
                <th className="py-4 px-4 text-right">Potongan Diskon</th>
                <th className="py-4 px-4 text-right">Total Transaksi</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-5 text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
              {orders.data.length > 0 ? (
                orders.data.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Order Number */}
                    <td className="py-4 px-5 font-mono font-bold text-slate-900 text-sm">
                      {order.order_number}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-slate-500 text-[10px] font-mono">
                      {formatDate(order.created_at, true)}
                    </td>

                    {/* Cashier */}
                    <td className="py-4 px-4 text-slate-700 font-semibold">
                      {order.user?.name || '-'}
                    </td>

                    {/* Payment method */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold uppercase text-[9px]">
                        {order.payment_method}
                      </span>
                    </td>

                    {/* Discount amount */}
                    <td className="py-4 px-4 text-right text-slate-500 font-mono">
                      {parseFloat(order.discount_amount) > 0 ? `-${formatCurrency(order.discount_amount)}` : '-'}
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-4 text-right font-bold text-slate-900 text-sm">
                      {formatCurrency(order.total_amount)}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(order.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <Link
                        href={route('admin.orders.show', order.id)}
                        className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-bold p-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer w-9 h-9"
                        title="Lihat Detail Transaksi"
                      >
                        <Eye size={13} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-1.5">
                      <FileText size={28} className="text-slate-300" />
                      <span>Tidak ada riwayat transaksi ditemukan.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {orders.links && orders.links.length > 3 && (
          <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Menampilkan {orders.from}-{orders.to} dari {orders.total} transaksi
            </span>
            <div className="flex gap-1">
              {orders.links.map((link, idx) => (
                <button
                  key={idx}
                  disabled={!link.url}
                  onClick={() => router.get(link.url)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    link.active 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  } disabled:opacity-50`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
