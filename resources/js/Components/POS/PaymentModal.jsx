import React from 'react';
import { useCartStore } from '@/stores/useCartStore';
import { formatCurrency } from '@/lib/formatters';
import { X, Wallet, CreditCard, Banknote, Landmark, ArrowRight, CircleAlert } from 'lucide-react';
import axios from 'axios';

export default function PaymentModal({ isOpen, onClose, onSuccess, taxRate = 11 }) {
  if (!isOpen) return null;

  const {
    items,
    discount,
    note,
    paymentMethod,
    paymentAmount,
    setPaymentMethod,
    setPaymentAmount,
    getTotal,
    getSubtotal,
  } = useCartStore();

  const total = getTotal(taxRate);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Format angka dengan titik ribuan untuk tampilan (Indonesia)
  const formatNumber = (num) => {
    if (!num && num !== 0) return '';
    return new Intl.NumberFormat('id-ID').format(num);
  };

  // Handler input uang — strip non-digit, parse to number, update store
  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/\D/g, ''); // hapus semua selain digit
    const numeric = raw ? parseInt(raw, 10) : 0;
    setPaymentAmount(numeric);
  };

  // Quick cash amount shortcuts
  const cashShortcuts = React.useMemo(() => {
    const roundToNext = (val, round) => Math.ceil(val / round) * round;
    const list = [total]; // Uang Pas

    const standardAmounts = [10000, 20000, 50000, 100000];
    standardAmounts.forEach((amt) => {
      if (amt > total && !list.includes(amt)) {
        list.push(amt);
      }
    });

    // Add some rounded ups
    const round50k = roundToNext(total, 50000);
    if (round50k > total && !list.includes(round50k)) list.push(round50k);

    const round100k = roundToNext(total, 100000);
    if (round100k > total && !list.includes(round100k)) list.push(round100k);

    return list.sort((a, b) => a - b).slice(0, 5);
  }, [total]);

  // Set default payment amount to total on mount or when changing non-cash methods
  React.useEffect(() => {
    if (paymentMethod !== 'cash') {
      setPaymentAmount(total);
    } else if (paymentAmount === 0) {
      setPaymentAmount(total);
    }
  }, [paymentMethod, total]);

  const changeAmount = Math.max(0, paymentAmount - total);
  const isAmountValid = paymentAmount >= total;

  const handleSubmit = async () => {
    if (!isAmountValid) {
      setError('Nominal pembayaran kurang dari total belanja.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        payment_method: paymentMethod,
        payment_amount: paymentAmount,
        discount_code: discount?.code || null,
        note: note || null,
      };

      const response = await axios.post(route('kasir.checkout'), payload);

      if (response.data.success) {
        onSuccess(response.data.order);
      } else {
        setError(response.data.message || 'Terjadi kesalahan saat checkout.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan sistem. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'cash', name: 'Tunai', icon: Banknote, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'qris', name: 'QRIS', icon: Wallet, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { id: 'card', name: 'Kartu Debit/Kredit', icon: CreditCard, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { id: 'transfer', name: 'Transfer Bank', icon: Landmark, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 shrink-0">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-100">Metode Pembayaran</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Pilih metode dan input nominal bayar</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
              <CircleAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Bill Overview */}
          <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Tagihan</span>
              <p className="text-2xl font-black text-white mt-1">{formatCurrency(total)}</p>
            </div>
            {discount && (
              <div className="text-right">
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {discount.name}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">
                  Subtotal: {formatCurrency(getSubtotal())}
                </p>
              </div>
            )}
          </div>

          {/* Selection of Payment Methods */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilih Metode</span>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;

                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-white/10 text-white' : method.color}`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-xs font-bold">{method.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount input & Cash shortcuts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {paymentMethod === 'cash' ? 'Uang Diterima' : 'Konfirmasi Jumlah'}
              </span>
              {paymentMethod === 'cash' && isAmountValid && (
                <span className="text-[10px] font-semibold text-emerald-400">
                  Kembalian: {formatCurrency(changeAmount)}
                </span>
              )}
            </div>

            {/* Input field — format otomatis titik ribuan */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">Rp</span>
              <input
                disabled={paymentMethod !== 'cash' || loading}
                type="text"
                inputMode="numeric"
                value={paymentAmount ? formatNumber(paymentAmount) : ''}
                onChange={handleAmountChange}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-600 focus:ring-0 focus:outline-none rounded-2xl pl-12 pr-4 py-4 text-xl font-black text-white placeholder-slate-700 disabled:opacity-60"
                placeholder="0"
              />
            </div>

            {/* Cash shortcut buttons (only for cash payments) */}
            {paymentMethod === 'cash' && (
              <div className="flex flex-wrap gap-2">
                {cashShortcuts.map((amount, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPaymentAmount(amount)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                      paymentAmount === amount
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-slate-800/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {amount === total ? 'Uang Pas' : formatCurrency(amount)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between gap-4 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            disabled={loading || !isAmountValid}
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-3.5 px-6 rounded-2xl text-xs shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Proses Pembayaran'}
            {!loading && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
