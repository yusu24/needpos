import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Edit2, Trash2, Tag, Percent, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function Index({ discounts, filters }) {
  const [search, setSearch] = React.useState(filters.search || '');

  // Debounced search
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      router.get(route('admin.discounts.index'), { search: search }, {
        preserveState: true,
        replace: true
      });
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus kode diskon ini?')) {
      router.delete(route('admin.discounts.destroy', id));
    }
  };

  const getDiscountValueString = (discount) => {
    if (discount.type === 'percentage') {
      return `${parseFloat(discount.value)}%`;
    } else if (discount.type === 'flat') {
      return formatCurrency(discount.value);
    } else if (discount.type === 'bogo') {
      return 'BOGO (Buy 1 Get 1)';
    }
    return discount.value;
  };

  return (
    <AppLayout header="Kelola Diskon & Promo">
      <Head title="Diskon & Promo" />

      {/* Action / Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200/80 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
            placeholder="Cari kode promo atau nama diskon..."
          />
        </div>

        <Link
          href={route('admin.discounts.create')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-5 rounded-2xl text-xs shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} />
          Buat Diskon Baru
        </Link>
      </div>

      {/* Discounts Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                <th className="py-4 px-5">Kode Promo</th>
                <th className="py-4 px-4">Nama Diskon</th>
                <th className="py-4 px-4 text-center">Tipe</th>
                <th className="py-4 px-4 text-right">Nilai Diskon</th>
                <th className="py-4 px-4 text-right">Min Belanja</th>
                <th className="py-4 px-4 text-center">Kuota Penggunaan</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-5 text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
              {discounts.data.length > 0 ? (
                discounts.data.map(disc => {
                  const isExpired = disc.expires_at && new Date(disc.expires_at) < new Date();
                  
                  return (
                    <tr key={disc.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Code */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono uppercase">
                          <Tag size={12} />
                          {disc.code}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 text-sm">{disc.name}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Calendar size={10} />
                          {disc.starts_at ? formatDate(disc.starts_at) : 'Kapan saja'} s/d {disc.expires_at ? formatDate(disc.expires_at) : 'Selamanya'}
                          {isExpired && <span className="text-rose-500 font-bold ml-1 uppercase text-[8px] tracking-wide">(Expired)</span>}
                        </div>
                      </td>

                      {/* Type badge */}
                      <td className="py-4 px-4 text-center">
                        <span className="text-[10px] capitalize text-slate-500 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">
                          {disc.type === 'bogo' ? 'Buy 1 Get 1' : disc.type}
                        </span>
                      </td>

                      {/* Value */}
                      <td className="py-4 px-4 text-right font-bold text-slate-800 text-sm">
                        {getDiscountValueString(disc)}
                      </td>

                      {/* Min Purchase */}
                      <td className="py-4 px-4 text-right text-slate-500">
                        {disc.min_purchase > 0 ? formatCurrency(disc.min_purchase) : 'Tanpa minimum'}
                      </td>

                      {/* Usage */}
                      <td className="py-4 px-4 text-center text-slate-600 font-semibold">
                        {disc.max_uses ? (
                          <div className="flex flex-col items-center">
                            <span>{disc.used_count} / {disc.max_uses}</span>
                            <div className="w-16 bg-slate-100 h-1 rounded-full mt-1 overflow-hidden border border-slate-200/30">
                              <div 
                                className="bg-indigo-600 h-full" 
                                style={{ width: `${Math.min((disc.used_count / disc.max_uses) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span>{disc.used_count}x terpakai</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                          disc.is_active && !isExpired
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {disc.is_active && !isExpired ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link
                            href={route('admin.discounts.edit', disc.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Diskon"
                          >
                            <Edit2 size={13} />
                          </Link>
                          <button
                            onClick={() => handleDelete(disc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Diskon"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-1.5">
                      <Percent size={28} className="text-slate-300" />
                      <span>Belum ada kode promo terdaftar. Silakan buat diskon baru.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {discounts.links && discounts.links.length > 3 && (
          <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Menampilkan {discounts.from}-{discounts.to} dari {discounts.total} diskon
            </span>
            <div className="flex gap-1">
              {discounts.links.map((link, idx) => (
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
    </AppLayout>
  );
}
