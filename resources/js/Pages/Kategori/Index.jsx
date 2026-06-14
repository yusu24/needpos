import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Edit2, Trash2, X, Check, Tag } from 'lucide-react';
import Pagination from '@/Components/Pagination';

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', 
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', 
  '#d946ef', '#ec4899', '#64748b'
];

export default function Index({ categories, filters = {} }) {
  const [editingCategory, setEditingCategory] = React.useState(null);

  // Form for Add/Edit
  const { data, setData, post, patch, reset, errors, processing } = useForm({
    name: '',
    color: '#3b82f6',
    icon: 'Tag',
    sort_order: 0,
    is_active: true,
  });

  const startEdit = (category) => {
    setEditingCategory(category.id);
    setData({
      name: category.name,
      color: category.color || '#3b82f6',
      icon: category.icon || 'Tag',
      sort_order: category.sort_order || 0,
      is_active: category.is_active,
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    reset();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      patch(route('admin.categories.update', editingCategory), {
        onSuccess: () => {
          setEditingCategory(null);
          reset();
        }
      });
    } else {
      post(route('admin.categories.store'), {
        onSuccess: () => reset()
      });
    }
  };

  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      router.delete(route('admin.categories.destroy', id));
    }
  };

  return (
    <AppLayout header="Kategori Produk">
      <Head title="Kategori Produk" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Category Form Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sticky top-20">
            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <Tag size={16} className="text-indigo-600" />
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nama Kategori</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  placeholder="Contoh: Makanan, Minuman, Obat"
                />
                {errors.name && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Urutan Tampilan</label>
                <input
                  type="number"
                  value={data.sort_order}
                  onChange={e => setData('sort_order', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
                {errors.sort_order && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.sort_order}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Warna Label</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setData('color', c)}
                      className="w-6 h-6 rounded-full border border-slate-200 transition-transform hover:scale-110 flex items-center justify-center cursor-pointer"
                      style={{ backgroundColor: c }}
                    >
                      {data.color === c && <Check size={12} className="text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={data.color}
                  onChange={e => setData('color', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
                  placeholder="#hexcolor"
                />
                {errors.color && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.color}</p>}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={data.is_active}
                  onChange={e => setData('is_active', e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="is_active" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
                  Aktif & Tampilkan di Kasir
                </label>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-indigo-600/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {editingCategory ? <Check size={14} /> : <Plus size={14} />}
                  {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
                </button>
                
                {editingCategory && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Categories Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                    <th className="py-4 px-5 w-16 text-center">Warna</th>
                    <th className="py-4 px-4">Nama Kategori</th>
                    <th className="py-4 px-4 text-center">Urutan</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                  {categories.data.length > 0 ? (
                    categories.data.map(cat => (
                      <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-5 text-center">
                          <div 
                            className="w-5 h-5 rounded-full border border-slate-200 mx-auto shadow-sm"
                            style={{ backgroundColor: cat.color || '#3b82f6' }}
                          />
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-slate-900">{cat.name}</span>
                        </td>
                        <td className="py-4 px-4 text-center text-slate-500">
                          {cat.sort_order}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cat.is_active 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {cat.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => startEdit(cat)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Kategori"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Kategori"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400">
                        Belum ada kategori terdaftar. Silakan tambah kategori baru.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Simple Pagination */}
            <Pagination
              paginator={categories}
              filters={filters}
              routeName="admin.categories.index"
              entityName="kategori"
              color="indigo"
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
