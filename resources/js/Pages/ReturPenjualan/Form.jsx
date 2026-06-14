import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft, Trash2, Plus, Info } from 'lucide-react';
import axios from 'axios';

export default function Form({ orders = [] }) {
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const { data, setData, post, processing, errors } = useForm({
    order_id: '',
    type: 'refund',
    note: '',
    total_amount: 0,
    items: [],
  });

  const handleOrderChange = async (e) => {
    const orderId = e.target.value;
    setData('order_id', orderId);

    if (!orderId) {
      setSelectedOrder(null);
      setData('items', []);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(route('admin.customer-returns.order-details', orderId));
      const order = response.data;
      setSelectedOrder(order);

      // Initial items structure from order items
      const initialItems = order.items.map(item => ({
        order_item_id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        max_qty: parseFloat(item.quantity),
        quantity: 0, // default to 0 to let cashier input
        product_price: parseFloat(item.product_price),
        reason: '',
      }));

      setData(prev => ({
        ...prev,
        order_id: orderId,
        items: initialItems,
        total_amount: 0,
      }));
    } catch (err) {
      alert('Gagal mengambil detail transaksi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = (index, qty) => {
    const newItems = [...data.items];
    const maxQty = newItems[index].max_qty;
    const finalQty = Math.min(maxQty, Math.max(0, parseFloat(qty) || 0));

    newItems[index].quantity = finalQty;
    recalculateTotals(newItems);
  };

  const handleReasonChange = (index, reason) => {
    const newItems = [...data.items];
    newItems[index].reason = reason;
    setData('items', newItems);
  };

  const recalculateTotals = (itemsList) => {
    const totalAmount = itemsList.reduce((acc, curr) => {
      return acc + (curr.quantity * curr.product_price);
    }, 0);

    setData(prev => ({
      ...prev,
      items: itemsList,
      total_amount: totalAmount,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.customer-returns.store'));
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <AppLayout header="Buat Retur Penjualan">
      <Head title="Buat Retur Penjualan" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Header bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href={route('admin.customer-returns.index')}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Retur Penjualan Baru</h2>
              <p className="text-xs text-slate-500 font-medium">Buat pengembalian barang dari Pelanggan.</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={processing || data.total_amount <= 0}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3.5 rounded-lg text-xs shadow-md shadow-teal-600/10 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            Simpan Retur (Draft)
          </button>
        </div>

        {errors.error && (
          <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold">
            {errors.error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* General Info */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
              <h3 className="text-xs font-bold text-slate-800 mb-4 tracking-wider uppercase border-b border-slate-100 pb-2">Informasi Retur</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Pilih Invoice Transaksi *</label>
                  <select
                    value={data.order_id}
                    onChange={handleOrderChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all cursor-pointer font-semibold"
                  >
                    <option value="">-- Pilih Transaksi --</option>
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>{o.order_number} ({formatCurrency(o.total_amount)})</option>
                    ))}
                  </select>
                  {errors.order_id && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.order_id}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tipe Tindakan Retur</label>
                  <select
                    value={data.type}
                    onChange={e => setData('type', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all cursor-pointer font-semibold"
                  >
                    <option value="refund">Refund (Kembalikan Uang)</option>
                    <option value="exchange">Exchange (Tukar Barang Baru)</option>
                  </select>
                  {errors.type && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.type}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Catatan Retur</label>
                  <textarea
                    value={data.note}
                    onChange={e => setData('note', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                    rows="2"
                    placeholder="Catatan tambahan mengenai kondisi barang retur..."
                  />
                  {errors.note && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.note}</p>}
                </div>
              </div>
            </div>

            {/* Items Card */}
            {selectedOrder && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
                <h3 className="text-xs font-bold text-slate-800 mb-4 tracking-wider uppercase border-b border-slate-100 pb-2">Item Barang Belanja</h3>
                
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-4 text-xs text-slate-400">Memuat detail barang...</div>
                  ) : data.items.map((item, index) => (
                    <div key={item.order_item_id} className="flex flex-col md:flex-row items-center gap-3 bg-slate-50/50 p-3 rounded-lg border border-slate-200/40">
                      <div className="flex-1">
                        <span className="text-xs font-bold text-slate-800 block">{item.product_name}</span>
                        <span className="text-[10px] text-slate-500 font-medium">Harga Beli: {formatCurrency(item.product_price)}</span>
                      </div>

                      <div className="w-full md:w-32">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kuantitas Retur (Max: {item.max_qty})</label>
                        <input
                          type="number"
                          min="0"
                          max={item.max_qty}
                          value={item.quantity}
                          onChange={e => handleQtyChange(index, e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 transition-all font-semibold"
                        />
                      </div>

                      <div className="flex-1 w-full">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Alasan Retur</label>
                        <input
                          type="text"
                          value={item.reason}
                          onChange={e => handleReasonChange(index, e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 transition-all"
                          placeholder="Misal: Cacat fisik / Tidak cocok size"
                        />
                      </div>

                      <div className="w-full md:w-24 text-right pr-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 text-center md:text-right">Subtotal</label>
                        <span className="text-xs font-bold text-slate-700 block mt-1">
                          {formatCurrency(item.quantity * item.product_price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing Totals Sidebar Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 sticky top-20 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase border-b border-slate-100 pb-2">Nilai Retur</h3>
              
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-700">Total Pengembalian</span>
                <span className="font-extrabold text-teal-600">{formatCurrency(data.total_amount)}</span>
              </div>

              {selectedOrder && (
                <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-lg flex flex-col gap-1.5 text-[11px] text-slate-600">
                  <div className="font-bold text-slate-700 flex items-center gap-1">
                    <Info size={12} className="text-teal-600" />
                    Info Order
                  </div>
                  <div>Pelanggan: {selectedOrder.customer?.name || 'Walk-in'}</div>
                  <div>Total Order: {formatCurrency(selectedOrder.total_amount)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
