import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Package, Upload } from 'lucide-react';

export default function Form({ product, categories }) {
  const isEdit = !!product;

  const { data, setData, post, processing, errors } = useForm({
    category_id: product?.category_id || '',
    name: product?.name || '',
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    price: product?.price || '',
    cost_price: product?.cost_price || '',
    description: product?.description || '',
    unit: product?.unit || 'Pcs',
    track_stock: isEdit ? !!product.track_stock : true,
    is_active: isEdit ? !!product.is_active : true,
    initial_stock: 0,
    min_stock: product?.stock?.min_quantity || 5,
    image_file: null,
  });

  // Normalisasi URL gambar dari server (bisa /storage/... atau sudah full URL)
  const resolveImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return window.location.origin + path;
  };

  const [imagePreview, setImagePreview] = React.useState(resolveImageUrl(product?.image) || null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('image_file', file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEdit) {
      // Laravel route is configured to accept POST for updating to support file upload
      post(route('admin.products.update', product.id));
    } else {
      post(route('admin.products.store'));
    }
  };

  return (
    <AppLayout header={isEdit ? `Edit Produk: ${product.name}` : 'Tambah Produk Baru'}>
      <Head title={isEdit ? 'Edit Produk' : 'Tambah Produk'} />

      <div className="max-w-4xl mx-auto py-6">
        {/* Back Link */}
        <Link
          href={route('admin.products.index')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft size={14} />
          Kembali ke Daftar Produk
        </Link>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left panel: Info Form */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Informasi Utama</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nama Produk *</label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    placeholder="Contoh: Kopi Susu Aren, Paracetamol 500mg"
                  />
                  {errors.name && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Kategori *</label>
                  <select
                    value={data.category_id}
                    onChange={e => setData('category_id', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="" disabled>Pilih Kategori</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category_id && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.category_id}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Satuan Jual *</label>
                  <input
                    type="text"
                    value={data.unit}
                    onChange={e => setData('unit', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    placeholder="Pcs, Box, Botol, Porsi..."
                  />
                  {errors.unit && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.unit}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">SKU (Stock Keeping Unit)</label>
                  <input
                    type="text"
                    value={data.sku}
                    onChange={e => setData('sku', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono"
                    placeholder="Contoh: KOP-001"
                  />
                  {errors.sku && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.sku}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Barcode / Kode Batang</label>
                  <input
                    type="text"
                    value={data.barcode}
                    onChange={e => setData('barcode', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono"
                    placeholder="Scan atau ketik barcode"
                  />
                  {errors.barcode && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.barcode}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Deskripsi Produk</label>
                <textarea
                  value={data.description}
                  onChange={e => setData('description', e.target.value)}
                  rows="3"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                  placeholder="Keterangan lengkap mengenai produk..."
                />
                {errors.description && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.description}</p>}
              </div>
            </div>

            {/* Financial Panel */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Harga & Keuangan</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Harga Jual *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      value={data.price}
                      onChange={e => setData('price', e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold text-slate-800"
                      placeholder="0"
                    />
                  </div>
                  {errors.price && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Harga Beli (COGS) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      value={data.cost_price}
                      onChange={e => setData('cost_price', e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold text-slate-500"
                      placeholder="0"
                    />
                  </div>
                  {errors.cost_price && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.cost_price}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Inventory, image and status */}
          <div className="space-y-6">
            {/* Status and Image Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-5">
              {/* Product Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Foto Produk</label>
                <div className="relative group flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl overflow-hidden bg-slate-50/50 transition-colors">
                  {imagePreview ? (
                    <div className="w-full h-full relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="bg-white hover:bg-slate-50 text-slate-800 font-bold px-3 py-1.5 rounded-xl text-[10px] shadow-md cursor-pointer flex items-center gap-1">
                          <Upload size={12} />
                          Ubah Foto
                          <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-1.5 cursor-pointer w-full h-full p-4">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                        <Upload size={16} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 group-hover:text-indigo-600">Pilih / Unggah Foto</span>
                      <span className="text-[8px] text-slate-400">Format JPG, PNG (Max 2MB)</span>
                      <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                    </label>
                  )}
                </div>
                {errors.image_file && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.image_file}</p>}
              </div>

              <hr className="border-slate-100" />

              {/* Status and Active Switch */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">Status Produk</span>
                    <span className="text-[10px] text-slate-400">Aktifkan untuk dijual di kasir</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={data.is_active}
                    onChange={e => setData('is_active', e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Stock / Inventory Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Stok & Inventaris</h3>

              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Lacak Stok Barang</span>
                  <span className="text-[10px] text-slate-400 font-medium">Pantau sisa persediaan otomatis</span>
                </div>
                <input
                  type="checkbox"
                  checked={data.track_stock}
                  onChange={e => setData('track_stock', e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {data.track_stock && (
                <div className="space-y-3 pt-2 border-t border-slate-100 animate-fade-in">
                  {!isEdit && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Stok Awal</label>
                      <input
                        type="number"
                        value={data.initial_stock}
                        onChange={e => setData('initial_stock', parseFloat(e.target.value) || 0)}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold"
                        placeholder="0"
                      />
                      {errors.initial_stock && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.initial_stock}</p>}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Batas Stok Minimum</label>
                    <input
                      type="number"
                      value={data.min_stock}
                      onChange={e => setData('min_stock', parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold"
                      placeholder="5"
                    />
                    <p className="text-[9px] text-slate-400 mt-1">Sistem akan memicu peringatan stok menipis jika kuantitas di bawah batas ini.</p>
                    {errors.min_stock && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.min_stock}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Card */}
            <div className="flex gap-3">
              <Link
                href={route('admin.products.index')}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-4 rounded-2xl text-xs transition-colors flex items-center justify-center cursor-pointer border border-slate-200/50"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="flex-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-2xl text-xs shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check size={14} />
                {isEdit ? 'Simpan Perubahan' : 'Simpan Produk'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
