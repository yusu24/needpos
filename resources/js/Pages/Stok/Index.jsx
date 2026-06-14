import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Search, Plus, SlidersHorizontal, RefreshCw, AlertTriangle, ArrowRightLeft, X, Check } from 'lucide-react';

export default function Index({ stocks, categories, filters }) {
  const [search, setSearch] = React.useState(filters.search || '');
  const [categoryId, setCategoryId] = React.useState(filters.category_id || '');
  const [isLow, setIsLow] = React.useState(filters.is_low === 'true');

  const [activeModal, setActiveModal] = React.useState(null); // 'restock' | 'adjust'
  const [selectedStock, setSelectedStock] = React.useState(null);

  const { data, setData, post, processing, reset, errors } = useForm({
    product_id: '',
    type: 'in', // 'in' or 'adjustment'
    quantity: '',
    note: '',
  });

  // Debounced search
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleFilterChange();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleFilterChange = (catId = categoryId, lowOnly = isLow) => {
    router.get(route('admin.stock.index'), {
      search: search,
      category_id: catId,
      is_low: lowOnly ? 'true' : ''
    }, {
      preserveState: true,
      replace: true
    });
  };

  const handleCategorySelect = (e) => {
    const id = e.target.value;
    setCategoryId(id);
    handleFilterChange(id, isLow);
  };

  const handleLowToggle = () => {
    const nextLow = !isLow;
    setIsLow(nextLow);
    handleFilterChange(categoryId, nextLow);
  };

  const openModal = (type, stock) => {
    setSelectedStock(stock);
    setData({
      product_id: stock.product_id,
      type: type === 'restock' ? 'in' : 'adjustment',
      quantity: type === 'restock' ? '' : stock.quantity,
      note: '',
    });
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedStock(null);
    reset();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.stock.store'), {
      onSuccess: () => closeModal()
    });
  };

  return (
    <AppLayout header="Persediaan Stok">
      <Head title="Stok Barang" />

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 max-w-3xl">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200/80 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
              placeholder="Cari produk berdasarkan nama atau SKU..."
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative w-full sm:w-44">
            <select
              value={categoryId}
              onChange={handleCategorySelect}
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200/80 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all appearance-none shadow-sm cursor-pointer"
            >
              <option value="">Semua Kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Low Stock Toggle */}
          <button
            onClick={handleLowToggle}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
              isLow 
                ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-rose-100' 
                : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle size={14} />
            Stok Hampir Habis
          </button>
        </div>

        {/* View movements link */}
        <Link
          href={route('admin.stock.movements')}
          className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-5 rounded-2xl text-xs shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <ArrowRightLeft size={14} />
          Riwayat Mutasi Stok
        </Link>
      </div>

      {/* Stocks Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                <th className="py-4 px-5">Produk</th>
                <th className="py-4 px-4">Kategori</th>
                <th className="py-4 px-4 text-center">Lacak Stok</th>
                <th className="py-4 px-4 text-right">Stok Saat Ini</th>
                <th className="py-4 px-4 text-right">Stok Minimal</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-5 text-right w-64">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
              {stocks.data.length > 0 ? (
                stocks.data.map(stock => (
                  <tr key={stock.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Product info */}
                    <td className="py-4 px-5">
                      <div className="font-semibold text-slate-900 text-sm">{stock.product_name}</div>
                      {stock.product_sku && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {stock.product_sku}</div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 text-slate-500">
                      {stock.category_name || <span className="text-slate-400">-</span>}
                    </td>

                    {/* Track Stock Toggle indicator */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        stock.track_stock 
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
                          : 'bg-slate-100 text-slate-500 border-slate-200/60'
                      }`}>
                        {stock.track_stock ? 'Dilacak' : 'Tidak Dilacak'}
                      </span>
                    </td>

                    {/* Current Stock */}
                    <td className="py-4 px-4 text-right">
                      {!stock.track_stock ? (
                        <span className="text-slate-400">-</span>
                      ) : (
                        <span className={`font-bold text-sm ${
                          stock.quantity <= stock.min_quantity ? 'text-rose-600' : 'text-slate-800'
                        }`}>
                          {Math.round(stock.quantity)}
                        </span>
                      )}
                    </td>

                    {/* Min Quantity */}
                    <td className="py-4 px-4 text-right text-slate-500">
                      {stock.track_stock ? Math.round(stock.min_quantity) : '-'}
                    </td>

                    {/* Alert status */}
                    <td className="py-4 px-4 text-center">
                      {stock.track_stock && stock.quantity <= stock.min_quantity ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-wider">
                          <AlertTriangle size={10} />
                          Hampir Habis
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
                          <Check size={10} />
                          Aman
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      {stock.track_stock ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openModal('restock', stock)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-1.5 px-3 rounded-xl text-[10px] transition-colors border border-indigo-100 cursor-pointer"
                          >
                            Tambah Stok
                          </button>
                          <button
                            onClick={() => openModal('adjust', stock)}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-1.5 px-3 rounded-xl text-[10px] transition-colors border border-slate-200 cursor-pointer"
                          >
                            Stock Opname
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No action</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    Tidak ada persediaan produk ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {stocks.links && stocks.links.length > 3 && (
          <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Menampilkan {stocks.from}-{stocks.to} dari {stocks.total} produk
            </span>
            <div className="flex gap-1">
              {stocks.links.map((link, idx) => (
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

      {/* Manual Restock / Stock Opname Modal */}
      {activeModal && selectedStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in select-none">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-800 text-sm">
                {activeModal === 'restock' ? 'Tambah Stok Manual' : 'Stock Opname (Penyesuaian)'}
              </h3>
              <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nama Produk</span>
                  <p className="font-bold text-slate-800 text-sm leading-snug">{selectedStock.product_name}</p>
                  <div className="flex gap-4 mt-2 pt-2 border-t border-slate-200/50 text-[10px] text-slate-500 font-medium">
                    <span>SKU: <span className="font-mono font-bold text-slate-700">{selectedStock.product_sku || '-'}</span></span>
                    <span>Stok Saat Ini: <span className="font-bold text-slate-700">{Math.round(selectedStock.quantity)}</span></span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    {activeModal === 'restock' ? 'Jumlah Tambahan Stok' : 'Jumlah Stok Sebenarnya'}
                  </label>
                  <input
                    type="number"
                    value={data.quantity}
                    onChange={e => setData('quantity', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold"
                    placeholder="0"
                  />
                  {errors.quantity && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.quantity}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Catatan / Alasan</label>
                  <input
                    type="text"
                    value={data.note}
                    onChange={e => setData('note', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    placeholder={activeModal === 'restock' ? 'Contoh: Restock bulanan, pengiriman supplier' : 'Contoh: Penyesuaian stok opname bulanan'}
                  />
                  {errors.note && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.note}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md shadow-indigo-600/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check size={14} />
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
