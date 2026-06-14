import React from 'react';
import { useCartStore } from '@/stores/useCartStore';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { X, Printer, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

export default function ReceiptModal({ isOpen, order, onClose }) {
  if (!isOpen || !order) return null;

  const clearCart = useCartStore((state) => state.clearCart);
  const receiptRef = React.useRef(null);

  // Initialize react-to-print handler
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Receipt-${order.order_number}`,
  });

  const handleNewTransaction = () => {
    clearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Success Header Status */}
        <div className="p-5 bg-emerald-500/10 border-b border-emerald-500/20 text-center shrink-0 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mb-2">
            <CheckCircle2 size={22} className="animate-scale-in" />
          </div>
          <h3 className="text-xs font-bold text-emerald-400">Pembayaran Berhasil</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Transaksi #{order.order_number} telah disimpan</p>
        </div>

        {/* Receipt Wrapper (Scrollable view) */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-none bg-slate-950/20 flex justify-center">
          {/* Printable Receipt Area */}
          <div
            ref={receiptRef}
            className="w-full bg-white text-slate-900 p-6 rounded-2xl shadow-inner font-mono text-[10px] leading-relaxed select-text"
            style={{ width: '100%', maxWidth: '300px' }}
          >
            {/* Header Shop Info */}
            <div className="text-center space-y-1 mb-4 border-b border-dashed border-slate-300 pb-3">
              <h2 className="text-xs font-black tracking-wider uppercase">{order.outlet?.name || 'NeedPOS Clone'}</h2>
              <p className="text-[8px] text-slate-500 leading-normal">{order.outlet?.address || 'Alamat Outlet'}</p>
              <p className="text-[8px] text-slate-500">Telp: {order.outlet?.phone || '-'}</p>
            </div>

            {/* Meta transaction info */}
            <div className="space-y-1 mb-4 border-b border-dashed border-slate-300 pb-3 text-[9px] text-slate-600">
              <div className="flex justify-between">
                <span>No. Order:</span>
                <span className="font-bold">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>{formatDate(order.created_at, true)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{order.cashier}</span>
              </div>
            </div>

            {/* List items table */}
            <div className="space-y-2 mb-4 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between font-bold border-b border-slate-200 pb-1 text-[9px]">
                <span>Menu</span>
                <span>Subtotal</span>
              </div>
              {order.items?.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-medium">
                    <span className="truncate max-w-[180px]">{item.product_name}</span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                  <div className="text-[8px] text-slate-500">
                    {Math.round(item.quantity)} x {formatCurrency(item.product_price)}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial breakdown */}
            <div className="space-y-1 text-[9px] text-slate-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>

              {parseFloat(order.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>
                    Diskon{order.discount ? ` (${order.discount.code})` : ''}:
                  </span>
                  <span>-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Pajak (PPN):</span>
                <span>{formatCurrency(order.tax_amount)}</span>
              </div>

              <div className="flex justify-between font-black text-slate-900 border-t border-dashed border-slate-300 pt-2 text-xs">
                <span>TOTAL:</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>

              <div className="flex justify-between pt-1">
                <span className="capitalize">{order.payment_method} Bayar:</span>
                <span>{formatCurrency(order.payment_amount)}</span>
              </div>

              {parseFloat(order.change_amount) > 0 && (
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Kembalian:</span>
                  <span>{formatCurrency(order.change_amount)}</span>
                </div>
              )}
            </div>

            {/* Note if any */}
            {order.note && (
              <div className="mt-4 p-2 bg-slate-50 border border-slate-100 rounded text-[8px] text-slate-500 italic">
                Catatan: {order.note}
              </div>
            )}

            {/* Footer message */}
            <div className="text-center mt-6 text-[8px] text-slate-400">
              <p>Terima kasih atas kunjungan Anda</p>
              <p className="mt-0.5">Powered by NeedPOS Clone</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex items-center gap-3 shrink-0">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-4 rounded-2xl text-xs transition-colors border border-slate-700 cursor-pointer"
          >
            <Printer size={14} />
            Cetak Struk
          </button>
          <button
            onClick={handleNewTransaction}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-2xl text-xs shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.99] transition-all duration-200 cursor-pointer"
          >
            <RefreshCw size={14} />
            Kasir Baru
          </button>
        </div>
      </div>
    </div>
  );
}
