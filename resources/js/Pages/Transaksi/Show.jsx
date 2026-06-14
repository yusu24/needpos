import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Printer, AlertTriangle, FileText, CheckCircle2, User, Wallet, Calendar, Tag, ShieldCheck, X } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import axios from 'axios';

export default function Show({ order }) {
  const [isVoidModalOpen, setIsVoidModalOpen] = React.useState(false);
  const [voidReason, setVoidReason] = React.useState('');
  const [voidErrors, setVoidErrors] = React.useState('');
  const [submittingVoid, setSubmittingVoid] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleVoidSubmit = (e) => {
    e.preventDefault();
    if (!voidReason.trim()) {
      setVoidErrors('Alasan void wajib diisi.');
      return;
    }

    setSubmittingVoid(true);
    setVoidErrors('');

    axios.post(route('admin.orders.void', order.id), {
      reason: voidReason
    })
    .then(response => {
      setSubmittingVoid(false);
      if (response.data.success) {
        setIsVoidModalOpen(false);
        setVoidReason('');
        router.reload();
      }
    })
    .catch(err => {
      setSubmittingVoid(false);
      if (err.response && err.response.data && err.response.data.message) {
        setVoidErrors(err.response.data.message);
      } else {
        setVoidErrors('Terjadi kesalahan saat membatalkan transaksi.');
      }
    });
  };

  return (
    <AppLayout header={`Detail Invoice #${order.order_number}`}>
      <Head title={`Invoice #${order.order_number}`} />

      <div className="max-w-4xl mx-auto">
        {/* Navigation and Actions */}
        <div className="flex items-center justify-between gap-4 mb-4 select-none">
          <Link
            href={route('admin.orders.index')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            Kembali ke Daftar Transaksi
          </Link>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer h-9"
            >
              <Printer size={13} />
              Cetak Struk
            </button>

            {order.status === 'paid' && (
              <button
                onClick={() => setIsVoidModalOpen(true)}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2 px-4 rounded-xl text-xs border border-rose-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer h-9"
              >
                <AlertTriangle size={13} />
                Void Transaksi
              </button>
            )}
          </div>
        </div>

        {/* Invoice Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left panel: Itemized List */}
          <div className="md:col-span-2 space-y-6">
            {/* Table of items */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 overflow-hidden">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 mb-4">Item Transaksi</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
                      <th className="pb-3">Menu / Produk</th>
                      <th className="pb-3 text-right">Harga Satuan</th>
                      <th className="pb-3 text-center w-20">Kuantitas</th>
                      <th className="pb-3 text-right w-28">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700 text-xs font-semibold">
                    {order.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/20 transition-colors">
                        <td className="py-4">
                          <span className="font-bold text-slate-900 text-sm">{item.product_name}</span>
                          {item.product?.sku && (
                            <span className="block text-[9px] text-slate-400 font-mono mt-0.5">SKU: {item.product.sku}</span>
                          )}
                        </td>
                        <td className="py-4 text-right text-slate-500 font-mono">
                          {formatCurrency(item.product_price)}
                        </td>
                        <td className="py-4 text-center text-slate-700 font-bold font-mono">
                          {Math.round(item.quantity)}
                        </td>
                        <td className="py-4 text-right text-slate-900 font-bold font-mono">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Void Status Card if voided */}
            {order.status === 'voided' && (
              <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200/50">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-rose-800 text-sm">Transaksi Ini Telah Dibatalakan (Void)</h4>
                  <p className="text-xs text-rose-700/80 mt-1">
                    Dibatalkan pada <strong>{formatDate(order.voided_at, true)}</strong> oleh <strong>{order.voided_by?.name || 'Sistem'}</strong>.
                  </p>
                  {order.void_reason && (
                    <div className="mt-3 p-3 bg-white/60 border border-rose-200/50 rounded-xl text-xs text-rose-800/90 italic">
                      Alasan: &ldquo;{order.void_reason}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Order Meta & Financial Summary */}
          <div className="space-y-6">
            {/* Meta summary card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Informasi Transaksi</h3>

              <div className="space-y-3.5 text-xs">
                {/* Date */}
                <div className="flex items-center gap-3">
                  <Calendar size={15} className="text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wide">Tanggal Transaksi</span>
                    <span className="font-semibold text-slate-700">{formatDate(order.created_at, true)}</span>
                  </div>
                </div>

                {/* Cashier */}
                <div className="flex items-center gap-3">
                  <User size={15} className="text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wide">Kasir Pembuka Shift</span>
                    <span className="font-semibold text-slate-700">{order.user?.name || '-'}</span>
                  </div>
                </div>

                {/* Payment method */}
                <div className="flex items-center gap-3">
                  <Wallet size={15} className="text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wide">Metode Pembayaran</span>
                    <span className="font-extrabold text-indigo-700 uppercase">{order.payment_method}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <ShieldCheck size={15} className="text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wide">Status Pembayaran</span>
                    <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      order.status === 'paid' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {order.status === 'paid' ? 'LUNAS / BERHASIL' : 'VOID (BATAL)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial breakdown card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-3 text-xs">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 mb-1">Rincian Pembayaran</h3>

              <div className="flex justify-between text-slate-500 font-semibold">
                <span>Subtotal:</span>
                <span className="font-mono">{formatCurrency(order.subtotal)}</span>
              </div>

              {parseFloat(order.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Potongan Diskon{order.discount ? ` (${order.discount.code})` : ''}:</span>
                  <span className="font-mono">-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500 font-semibold">
                <span>Pajak (PPN):</span>
                <span className="font-mono">{formatCurrency(order.tax_amount)}</span>
              </div>

              <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-100 pt-2 pb-1">
                <span>TOTAL AKHIR:</span>
                <span className="font-mono text-indigo-600">{formatCurrency(order.total_amount)}</span>
              </div>

              <div className="flex justify-between text-slate-600 pt-1 border-t border-dashed border-slate-200">
                <span className="capitalize">{order.payment_method} Diterima:</span>
                <span className="font-mono font-bold text-slate-800">{formatCurrency(order.payment_amount)}</span>
              </div>

              {parseFloat(order.change_amount) > 0 && (
                <div className="flex justify-between text-slate-700 font-bold">
                  <span>Kembalian:</span>
                  <span className="font-mono">{formatCurrency(order.change_amount)}</span>
                </div>
              )}

              {order.note && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] text-slate-500 leading-relaxed italic">
                  Catatan Kasir: {order.note}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Void Confirmation Modal */}
      {isVoidModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in select-none">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 text-rose-700">
                <AlertTriangle size={16} />
                Batal / Void Transaksi ini?
              </h3>
              <button onClick={() => setIsVoidModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleVoidSubmit}>
              <div className="p-5 space-y-4">
                <div className="bg-rose-50 border border-rose-200/50 rounded-2xl p-4 text-xs text-rose-700 leading-relaxed">
                  <p className="font-bold mb-1">Peringatan Tindakan Fatal:</p>
                  Tindakan ini akan membatalkan status pembayaran transaksi ini. Stok barang yang terpotong akan **dikembalikan (restore)** ke persediaan secara otomatis dan transaksi ditandai sebagai **VOID**.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Alasan Pembatalan (Void) *</label>
                  <textarea
                    value={voidReason}
                    onChange={e => setVoidReason(e.target.value)}
                    rows="3"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 focus:bg-white transition-all resize-none"
                    placeholder="Ketik alasan pembatalan order ini secara jelas..."
                  />
                  {voidErrors && <p className="text-[10px] text-rose-500 mt-1 font-medium">{voidErrors}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0 justify-end">
                <button
                  type="button"
                  onClick={() => setIsVoidModalOpen(false)}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-200 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={submittingVoid}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md shadow-rose-600/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                  Ya, Batalkan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
