import React from 'react';
import { useCartStore } from '@/stores/useCartStore';
import { formatCurrency } from '@/lib/formatters';
import { Trash2, Plus, Minus, Tag, FileText, ShoppingBag, X } from 'lucide-react';
import axios from 'axios';

export default function CartPanel({ onCheckout, taxRate = 11 }) {
  const {
    items,
    discount,
    note,
    removeItem,
    updateQty,
    applyDiscount,
    setNote,
    clearCart,
    getSubtotal,
    getDiscountAmount,
    getTaxAmount,
    getTotal,
  } = useCartStore();

  const [discountCode, setDiscountCode] = React.useState('');
  const [discountLoading, setDiscountLoading] = React.useState(false);
  const [discountError, setDiscountError] = React.useState('');
  const [discountSuccess, setDiscountSuccess] = React.useState('');

  const [showNoteInput, setShowNoteInput] = React.useState(false);

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const taxAmount = getTaxAmount(taxRate);
  const total = getTotal(taxRate);

  // Sync discount validation when items/subtotal changes
  React.useEffect(() => {
    if (discount && subtotal < parseFloat(discount.min_purchase)) {
      // Auto remove discount if subtotal drops below minimum purchase requirement
      applyDiscount(null);
      setDiscountSuccess('');
      setDiscountError(`Diskon dilepas karena belanja kurang dari ${formatCurrency(discount.min_purchase)}`);
      setTimeout(() => setDiscountError(''), 5000);
    }
  }, [subtotal, discount]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setDiscountLoading(true);
    setDiscountError('');
    setDiscountSuccess('');

    try {
      const response = await axios.post(route('kasir.discount.validate'), {
        code: discountCode.trim(),
        subtotal: subtotal,
      });

      if (response.data.success) {
        applyDiscount(response.data.discount);
        setDiscountSuccess(`Berhasil menerapkan ${response.data.discount.name}`);
        setDiscountCode('');
      }
    } catch (error) {
      setDiscountError(error.response?.data?.message || 'Gagal menerapkan kode diskon.');
      applyDiscount(null);
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    applyDiscount(null);
    setDiscountSuccess('');
    setDiscountError('');
  };

  return (
    <aside className="cart-panel">
      {/* Header */}
      <div className="cart-header select-none">
        <span className="cart-title">
          <ShoppingBag size={16} className="mr-2" style={{ color: 'var(--teal)' }} />
          Pesanan
        </span>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="cart-clear"
            aria-label="Hapus semua item"
          >
            Hapus Semua
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="cart-items">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.product_id}
              className="cart-item"
            >
              <span className="item-icon">🍔</span>
              {/* Product Info */}
              <div className="item-info">
                <h4 className="item-name" title={item.name}>{item.name}</h4>
                <p className="item-price">
                  {formatCurrency(item.price)}
                  {item.track_stock && (
                    <span className="ml-1 text-[9px] text-slate-400">
                      (Sisa: {Math.round(item.max_stock)})
                    </span>
                  )}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="qty-ctrl">
                <button
                  onClick={() => updateQty(item.product_id, item.quantity - 1)}
                  className="qty-btn"
                  aria-label="Kurang satu"
                >
                  −
                </button>
                <span className="qty-num">{item.quantity}</span>
                <button
                  disabled={item.track_stock && item.quantity >= item.max_stock}
                  onClick={() => updateQty(item.product_id, item.quantity + 1)}
                  className="qty-btn"
                  aria-label="Tambah satu"
                >
                  +
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-cart select-none">
            <ShoppingBag size={36} />
            <p>Keranjang kosong</p>
          </div>
        )}
      </div>

      {/* Checkout calculations & Footer */}
      <div className="cart-footer">
        {/* Discount Coupon Code Form */}
        <div className="discount-row">
          <input
            disabled={items.length === 0 || discountLoading}
            type="text"
            placeholder="Kode diskon (e.g. HEMAT10)"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
            className="disc-input"
          />
          <button
            disabled={items.length === 0 || discountLoading || !discountCode.trim()}
            onClick={handleApplyDiscount}
            className="disc-btn"
          >
            {discountLoading ? '...' : 'Pakai'}
          </button>
        </div>

        {/* Feedback messages */}
        {discountError && <p className="text-[10px] font-semibold text-rose-500 mb-2">{discountError}</p>}
        {discountSuccess && <p className="text-[10px] font-semibold text-emerald-600 mb-2">{discountSuccess}</p>}

        {/* Active Discount badge */}
        {discount && (
          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold mb-3">
            <span className="flex items-center gap-1.5">
              🏷️ {discount.name} ({discount.code})
            </span>
            <button onClick={handleRemoveDiscount} className="p-0.5 hover:bg-emerald-500/20 rounded">
              <X size={10} />
            </button>
          </div>
        )}

        {/* Note Trigger Button */}
        <div className="flex gap-2 mb-3 select-none">
          <button
            onClick={() => setShowNoteInput(!showNoteInput)}
            className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
              note
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
            }`}
          >
            📝 {note ? 'Edit Catatan' : 'Tambah Catatan'}
          </button>
        </div>

        {/* Note input panel */}
        {showNoteInput && (
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex gap-2 mb-3">
            <textarea
              placeholder="Tambahkan catatan khusus transaksi di sini..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex-1 min-h-[44px] bg-transparent border-0 text-[10px] text-slate-700 placeholder-slate-400 p-0 focus:ring-0 focus:outline-none resize-none"
            />
            <button
              onClick={() => setShowNoteInput(false)}
              className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-[10px] self-end"
            >
              OK
            </button>
          </div>
        )}

        {/* Financial Breakdown */}
        <div className="totals select-none">
          <div className="total-row">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="total-row" style={{ color: '#E24B4A' }}>
              <span>Diskon</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}

          <div className="total-row">
            <span>Pajak (11%)</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>

          <div className="total-row grand">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Action checkout button */}
        <button
          disabled={items.length === 0}
          onClick={onCheckout}
          className="checkout-btn"
        >
          Bayar Sekarang
        </button>
      </div>
    </aside>
  );
}
