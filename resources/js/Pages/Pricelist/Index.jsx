import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit2, Trash2, Tag, Coins } from 'lucide-react';

export default function Index({ pricelists }) {
  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus pricelist ini?')) {
      router.delete(route('admin.pricelists.destroy', id));
    }
  };

  const getTypeBadge = (type) => {
    const badges = {
      retail: 'bg-blue-50 text-blue-600 border border-blue-100',
      wholesale: 'bg-amber-50 text-amber-600 border border-amber-100',
      member: 'bg-purple-50 text-purple-600 border border-purple-100',
    };
    const labels = {
      retail: 'Retail (Eceran)',
      wholesale: 'Wholesale (Grosir)',
      member: 'Member',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badges[type] || 'bg-slate-100 text-slate-600'}`}>
        {labels[type] || type}
      </span>
    );
  };

  return (
    <AppLayout header="Pricelist (Tipe Harga)">
      <Head title="Pricelist" />

      <div className="flex flex-col gap-4">
        {/* Header Section */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Daftar Pricelist</h2>
            <p className="text-xs text-slate-500">Kelola harga grosir, eceran, dan harga khusus member.</p>
          </div>
          <Link
            href={route('admin.pricelists.create')}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3.5 rounded-lg text-xs shadow-md shadow-teal-600/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            Buat Pricelist
          </Link>
        </div>

        {/* Table List Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                  <th className="py-3 px-4">Nama Pricelist</th>
                  <th className="py-3 px-4">Tipe Konsumen</th>
                  <th className="py-3 px-4 text-center">Jumlah Produk</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                {pricelists.data.length > 0 ? (
                  pricelists.data.map((pl) => (
                    <tr key={pl.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                        <Coins size={14} className="text-teal-600" />
                        {pl.name}
                      </td>
                      <td className="py-3.5 px-4">{getTypeBadge(pl.type)}</td>
                      <td className="py-3.5 px-4 text-center text-slate-500">{pl.items_count} Produk</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link
                            href={route('admin.pricelists.edit', pl.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </Link>
                          <button
                            onClick={() => handleDelete(pl.id)}
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
                    <td colSpan="4" className="py-8 text-center text-slate-400">
                      Belum ada pricelist terdaftar. Silakan buat pricelist baru.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pricelists.links && pricelists.links.length > 3 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-[10px] text-slate-500">
                Menampilkan {pricelists.from}-{pricelists.to} dari {pricelists.total} pricelist
              </span>
              <div className="flex gap-1">
                {pricelists.links.map((link, idx) => (
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
