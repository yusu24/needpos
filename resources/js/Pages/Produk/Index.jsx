import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Edit2, Trash2, SlidersHorizontal, Package, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import Pagination from '@/Components/Pagination';

export default function Index({ products, categories, filters }) {
  const [search, setSearch] = React.useState(filters.search || '');
  const [categoryId, setCategoryId] = React.useState(filters.category_id || '');

  // Debounced search trigger
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleFilterChange();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleFilterChange = (catId = categoryId) => {
    router.get(route('admin.products.index'), {
      search: search,
      category_id: catId,
      per_page: filters.per_page || 15
    }, {
      preserveState: true,
      replace: true
    });
  };

  const handleCategorySelect = (e) => {
    const id = e.target.value;
    setCategoryId(id);
    handleFilterChange(id);
  };

  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini? Semua data stok terkait juga akan dihapus.')) {
      router.delete(route('admin.products.destroy', id));
    }
  };

  return (
    <AppLayout header="Daftar Produk">
      <Head title="Daftar Produk" />

      {/* Action and Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 max-w-2xl">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200/80 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
              placeholder="Cari produk berdasarkan nama, SKU, atau barcode..."
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative w-full sm:w-48">
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
        </div>

        {/* Create Button */}
        <Link
          href={route('admin.products.create')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-5 rounded-2xl text-xs shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} />
          Tambah Produk
        </Link>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                <th className="py-4 px-5 w-16">Foto</th>
                <th className="py-4 px-4">Info Produk</th>
                <th className="py-4 px-4">Kategori</th>
                <th className="py-4 px-4 text-right">Harga Jual</th>
                <th className="py-4 px-4 text-right">Harga Beli</th>
                <th className="py-4 px-4 text-center">Stok</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-5 text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
              {products.data.length > 0 ? (
                products.data.map(prod => (
                  <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Image */}
                    <td className="py-4 px-5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden flex items-center justify-center text-slate-400">
                        {prod.image ? (
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={18} />
                        )}
                      </div>
                    </td>

                    {/* Info */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900 text-sm">{prod.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 space-x-2">
                        {prod.sku && <span>SKU: {prod.sku}</span>}
                        {prod.barcode && <span>Barcode: {prod.barcode}</span>}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      {prod.category ? (
                        <span 
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border"
                          style={{ 
                            color: prod.category.color || '#4f46e5', 
                            borderColor: `${prod.category.color}30` || '#4f46e530',
                            backgroundColor: `${prod.category.color}08` || '#4f46e508' 
                          }}
                        >
                          {prod.category.name}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 text-right font-semibold text-slate-900">
                      {formatCurrency(prod.price)}
                    </td>

                    {/* Cost Price */}
                    <td className="py-4 px-4 text-right text-slate-500 font-medium">
                      {formatCurrency(prod.cost_price)}
                    </td>

                    {/* Stock */}
                    <td className="py-4 px-4 text-center">
                      {!prod.track_stock ? (
                        <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/50">Unlimited</span>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className={`font-bold ${
                            prod.stock?.quantity <= prod.stock?.min_quantity 
                              ? 'text-rose-600 font-black' 
                              : 'text-slate-700'
                          }`}>
                            {Math.round(prod.stock?.quantity || 0)} {prod.unit}
                          </span>
                          {prod.stock?.quantity <= prod.stock?.min_quantity && (
                            <span className="text-[8px] text-rose-500 font-semibold mt-0.5 uppercase tracking-wide">Min: {prod.stock?.min_quantity}</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        prod.is_active 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {prod.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link
                          href={route('admin.products.edit', prod.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Produk"
                        >
                          <Edit2 size={13} />
                        </Link>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Produk"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Package size={28} className="text-slate-300" />
                      <span>Tidak ada produk ditemukan. Silakan tambahkan produk baru.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          paginator={products}
          filters={filters}
          routeName="admin.products.index"
          entityName="produk"
          color="indigo"
        />
      </div>
    </AppLayout>
  );
}
