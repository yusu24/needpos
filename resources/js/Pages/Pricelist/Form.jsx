import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft, Trash2, Plus } from 'lucide-react';

export default function Form({ pricelist = null, products = [] }) {
  const isEdit = !!pricelist;

  const { data, setData, post, patch, processing, errors } = useForm({
    name: pricelist?.name || '',
    type: pricelist?.type || 'retail',
    items: pricelist?.items?.map(i => ({
      product_id: i.product_id,
      price: parseFloat(i.price),
      min_qty: i.min_qty,
    })) || [],
  });

  const handleAddItem = () => {
    setData('items', [
      ...data.items,
      { product_id: products[0]?.id || '', price: 0, min_qty: 1 },
    ]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...data.items];
    newItems.splice(index, 1);
    setData('items', newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...data.items];
    newItems[index][field] = value;
    setData('items', newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      patch(route('admin.pricelists.update', pricelist.id));
    } else {
      post(route('admin.pricelists.store'));
    }
  };

  return (
    <AppLayout header={isEdit ? 'Edit Pricelist' : 'Tambah Pricelist Baru'}>
      <Head title={isEdit ? 'Edit Pricelist' : 'Tambah Pricelist'} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Header bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href={route('admin.pricelists.index')}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h2 className="text-sm font-bold text-slate-800">{isEdit ? 'Edit Pricelist' : 'Pricelist Baru'}</h2>
              <p className="text-xs text-slate-500">Form untuk mendefinisikan skema harga khusus.</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={processing}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3.5 rounded-lg text-xs shadow-md shadow-teal-600/10 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            Simpan Pricelist
          </button>
        </div>

        {/* General Form Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
          <h3 className="text-xs font-bold text-slate-800 mb-4 tracking-wider uppercase border-b border-slate-100 pb-2">Informasi Umum</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nama Pricelist</label>
              <input
                type="text"
                value={data.name}
                onChange={e => setData('name', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                placeholder="Contoh: Harga Grosir Level 1"
              />
              {errors.name && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tipe Tipe Konsumen</label>
              <select
                value={data.type}
                onChange={e => setData('type', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="retail">Retail (Eceran)</option>
                <option value="wholesale">Wholesale (Grosir)</option>
                <option value="member">Member</option>
              </select>
              {errors.type && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.type}</p>}
            </div>
          </div>
        </div>

        {/* Product Pricings List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase">Daftar Produk & Harga Spesial</h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-teal-600 hover:text-teal-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              Tambah Produk
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
                        <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku || '-'})</option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full md:w-48">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Harga Baru (IDR)</label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 transition-all"
                      placeholder="Harga"
                    />
                  </div>

                  <div className="w-full md:w-32">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Min. Kuantitas</label>
                    <input
                      type="number"
                      value={item.min_qty}
                      onChange={e => handleItemChange(index, 'min_qty', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 transition-all"
                      placeholder="Min Qty"
                    />
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
              <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                Belum ada produk yang diset harga khusus. Klik "Tambah Produk" untuk menambahkan harga spesial.
              </div>
            )}
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
