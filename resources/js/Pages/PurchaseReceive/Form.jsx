import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft } from 'lucide-react';

export default function Form({ purchaseOrder }) {
  const { data, setData, post, processing, errors } = useForm({
    note: '',
    items: purchaseOrder.items.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      ordered_qty: parseFloat(item.ordered_qty),
      already_received: parseFloat(item.received_qty),
      remaining_qty: Math.max(0, parseFloat(item.ordered_qty) - parseFloat(item.received_qty)),
      qty_received: Math.max(0, parseFloat(item.ordered_qty) - parseFloat(item.received_qty)), // default to fill remainder
      unit_price: parseFloat(item.unit_price),
    })),
  });

  const handleQtyChange = (index, val) => {
    const newItems = [...data.items];
    newItems[index].qty_received = parseFloat(val) || 0;
    setData('items', newItems);
  };

  const handlePriceChange = (index, val) => {
    const newItems = [...data.items];
    newItems[index].unit_price = parseFloat(val) || 0;
    setData('items', newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.purchase-receives.store', purchaseOrder.id));
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <AppLayout header="Penerimaan Barang Dari PO">
      <Head title="Terima Barang PO" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Header bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href={route('admin.purchase-orders.show', purchaseOrder.id)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Penerimaan PO #{purchaseOrder.po_number}</h2>
              <p className="text-xs text-slate-500">Realisasikan barang yang datang fisik ke gudang/outlet.</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={processing}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3.5 rounded-lg text-xs shadow-md shadow-teal-600/10 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            Konfirmasi Terima Barang
          </button>
        </div>

        {errors.error && (
          <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold">
            {errors.error}
          </div>
        )}

        {/* Note Area */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Catatan Penerimaan / Surat Jalan</label>
          <textarea
            value={data.note}
            onChange={e => setData('note', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
            rows="2"
            placeholder="Tulis no. surat jalan dari supplier, kondisi fisik barang, dsb..."
          />
          {errors.note && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.note}</p>}
        </div>

        {/* Items Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
          <h3 className="text-xs font-bold text-slate-800 mb-4 tracking-wider uppercase border-b border-slate-100 pb-2">Daftar Kuantitas Fisik Diterima</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                  <th className="py-2 px-3">Nama Item</th>
                  <th className="py-2 px-3 text-center">Dipesan</th>
                  <th className="py-2 px-3 text-center">Sudah Terima</th>
                  <th className="py-2 px-3 text-center">Kekurangan</th>
                  <th className="py-2 px-3 text-center w-36">Jumlah Diterima Hari Ini</th>
                  <th className="py-2 px-3 text-center w-40">Harga Beli Aktual (Terakhir)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                {data.items.map((item, index) => (
                  <tr key={item.product_id}>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-900 block">{item.product_name}</span>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500">{item.ordered_qty}</td>
                    <td className="py-3 px-3 text-center text-slate-500">{item.already_received}</td>
                    <td className="py-3 px-3 text-center font-bold text-amber-600">{item.remaining_qty}</td>
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max={item.remaining_qty}
                        value={item.qty_received}
                        onChange={e => handleQtyChange(index, e.target.value)}
                        className="w-full text-center px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white"
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        value={item.unit_price}
                        onChange={e => handlePriceChange(index, e.target.value)}
                        className="w-full text-center px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white font-mono"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
