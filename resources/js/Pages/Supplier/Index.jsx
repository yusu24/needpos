import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit2, Trash2, Search, MapPin, Phone, Mail } from 'lucide-react';
import debounce from 'lodash/debounce';

export default function Index({ suppliers, filters }) {
  const [search, setSearch] = React.useState(filters.search || '');

  const debouncedSearch = React.useMemo(
    () =>
      debounce((value) => {
        router.get(
          route('admin.suppliers.index'),
          { search: value },
          { preserveState: true, replace: true }
        );
      }, 300),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus supplier ini?')) {
      router.delete(route('admin.suppliers.destroy', id));
    }
  };

  return (
    <AppLayout header="Pemasok (Supplier)">
      <Head title="Supplier" />

      <div className="flex flex-col gap-4">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Daftar Supplier</h2>
            <p className="text-xs text-slate-500 font-medium">Kelola data vendor pemasok produk/barang dagang.</p>
          </div>
          
          <div className="flex w-full md:w-auto items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium"
                placeholder="Cari nama / contact person..."
              />
            </div>
            
            <Link
              href={route('admin.suppliers.create')}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3.5 rounded-lg text-xs shadow-md shadow-teal-600/10 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus size={14} />
              Tambah Supplier
            </Link>
          </div>
        </div>

        {/* Suppliers List Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                  <th className="py-3 px-4">Nama Supplier</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Kontak</th>
                  <th className="py-3 px-4">Alamat</th>
                  <th className="py-3 px-4">Syarat Bayar</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                {suppliers.data.length > 0 ? (
                  suppliers.data.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{supplier.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{supplier.contact_person || '-'}</td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <div className="flex flex-col gap-0.5">
                          {supplier.phone && (
                            <span className="flex items-center gap-1 text-[10px]">
                              <Phone size={10} className="text-teal-600" /> {supplier.phone}
                            </span>
                          )}
                          {supplier.email && (
                            <span className="flex items-center gap-1 text-[10px]">
                              <Mail size={10} className="text-blue-500" /> {supplier.email}
                            </span>
                          )}
                          {!supplier.phone && !supplier.email && '-'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-[200px] truncate">
                        {supplier.address || '-'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px]">{supplier.payment_terms || 'COD'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          supplier.is_active
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {supplier.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link
                            href={route('admin.suppliers.edit', supplier.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </Link>
                          <button
                            onClick={() => handleDelete(supplier.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      Supplier tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {suppliers.links && suppliers.links.length > 3 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-[10px] text-slate-500">
                Menampilkan {suppliers.from}-{suppliers.to} dari {suppliers.total} supplier
              </span>
              <div className="flex gap-1">
                {suppliers.links.map((link, idx) => (
                  <button
                    key={idx}
                    disabled={!link.url}
                    onClick={() => router.get(link.url)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      link.active
                        ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/10'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    } disabled:opacity-50`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
