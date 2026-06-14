import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft, Trash2, Plus } from 'lucide-react';

export default function Form({ suppliers = [], products = [] }) {
  const { data, setData, post, processing, errors } = useForm({
    supplier_id: suppliers[0]?.id || '',
    reason: '',
    note: '',
    total_amount: 0,
    items: [],
  });

  const handleAddItem = () => {
    setData('items', [
      ...data.items,
      { product_id: products[0]?.id || '', quantity: 1, unit_price: parseFloat(products[0]?.cost_price || 0) },
    ]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...data.items];
    newItems.splice(index, 1);
    recalculateTotals(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...data.items];

    if (field === 'product_id') {
      const selectedProd = products.find(p => p.id === parseInt(value));
      newItems[index].product_id = value;
      newItems[index].unit_price = parseFloat(selectedProd?.cost_price || 0);
    } else {
      newItems[index][field] = value;
    }

    recalculateTotals(newItems);
  };

  const recalculateTotals = (itemsList) => {
    const totalAmount = itemsList.reduce((acc, curr) => {
      const qty = parseFloat(curr.quantity) || 0;
      const price = parseFloat(curr.unit_price) || 0;
      return acc + (qty * price);
    }, 0);

    setData({
      ...data,
      items: itemsList,
      total_amount: totalAmount,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.supplier-returns.store'));
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <AppLayout header="Buat Retur Ke Supplier">
      <Head title="Buat Retur Supplier" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Header bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href={route('admin.supplier-returns.index')}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Retur Supplier Baru</h2>
              <p className="text-xs text-slate-500 font-medium">Buat pengembalian barang dagangan ke Supplier.</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={processing}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3.5 rounded-lg text-xs shadow-md shadow-teal-600/10 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            Simpan Retur (Draft)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* General Info */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
              <h3 className="text-xs font-bold text-slate-800 mb-4 tracking-wider uppercase border-b border-slate-100 pb-2">Informasi Retur</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Pilih Supplier *</label>
                  <select
                    value={data.supplier_id}
                    onChange={e => setData('supplier_id', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all cursor-pointer"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {errors.supplier_id && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.supplier_id}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Alasan Retur</label>
                  <input
                    type="text"
                    value={data.reason}
                    onChange={e => setData('reason', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                    placeholder="Contoh: Barang Rusak / Kadaluarsa"
                  />
                  {errors.reason && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.reason}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Catatan Tambahan</label>
                  <textarea
                    value={data.note}
                    onChange={e => setData('note', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                    rows="2"
                    placeholder="Catatan tambahan mengenai retur..."
                  />
                  {errors.note && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.note}</p>}
                </div>
              </div>
            </div>

            {/* Items Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase">Daftar Item Retur</h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-teal-600 hover:text-teal-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  Tambah Item
                </button>
              </div>

              {errors.items && <p className="text-xs text-rose-500 mb-4 font-medium">{errors.items}</p>}

              <div className="space-y-3">
                {data.items.length > 0 ? (
                  data.items.map((item, index) => (
                    <div key={index} className="flex flex-col md:flex-row items-center gap-3 bg-slate-50/50 p-3 rounded-lg border border-slate-200/40">
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pilih Produk</label>
                        <select
                          value={item.product_id}
                          onChange={e => handleItemChange(index, 'product_id', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 transition-all cursor-pointer"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock?.quantity || 0})</option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full md:w-32">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Qty Retur</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 transition-all"
                          placeholder="Jumlah"
                        />
                      </div>

                      <div className="w-full md:w-40">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Harga Beli Satuan (IDR)</label>
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={e => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 transition-all"
                          placeholder="Harga Satuan"
                        />
                      </div>

                      <div className="w-full md:w-28 text-right pr-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 text-center md:text-right">Subtotal</label>
                        <span className="text-xs font-bold text-slate-700 block mt-1">
                          {formatCurrency(item.quantity * item.unit_price)}
                        </span>
                      </div>

                      <div className="pt-4 md:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                    Belum ada item ditambahkan untuk diretur. Klik "Tambah Item" untuk memulai.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Totals Sidebar Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 sticky top-20 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase border-b border-slate-100 pb-2">Nilai Retur</h3>
              
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-700">Total Nilai Retur</span>
                <span className="font-extrabold text-teal-600">{formatCurrency(data.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
