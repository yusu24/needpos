import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit2, Trash2, Search, User, Gift, Award } from 'lucide-react';
import debounce from 'lodash/debounce';
import Pagination from '@/Components/Pagination';

export default function Index({ customers, filters }) {
  const [search, setSearch] = React.useState(filters.search || '');

  const debouncedSearch = React.useMemo(
    () =>
      debounce((value) => {
        router.get(
          route('admin.customers.index'),
          { search: value, per_page: filters.per_page || 10 },
          { preserveState: true, replace: true }
        );
      }, 300),
    [filters.per_page]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
      router.delete(route('admin.customers.destroy', id));
    }
  };

  const getTierBadge = (tier) => {
    const badges = {
      regular: 'bg-slate-100 text-slate-600 border border-slate-200',
      silver: 'bg-zinc-100 text-zinc-700 border border-zinc-300',
      gold: 'bg-amber-50 text-amber-600 border border-amber-200',
    };
    const labels = {
      regular: 'Regular',
      silver: 'Silver',
      gold: 'Gold',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${badges[tier] || 'bg-slate-100'}`}>
        <Award size={10} />
        {labels[tier] || tier}
      </span>
    );
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <AppLayout header="Pelanggan & Member">
      <Head title="Pelanggan" />

      <div className="flex flex-col gap-4">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Manajemen Pelanggan</h2>
            <p className="text-xs text-slate-500 font-medium">Data member pelanggan, poin reward loyalitas, dan total belanja.</p>
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
                placeholder="Cari nama, email, no hp..."
              />
            </div>

            <Link
              href={route('admin.customers.create')}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3.5 rounded-lg text-xs shadow-md shadow-teal-600/10 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus size={14} />
              Daftar Member
            </Link>
          </div>
        </div>

        {/* List Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                  <th className="py-3 px-4">Nama Pelanggan</th>
                  <th className="py-3 px-4">No. HP</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Loyalty Tier</th>
                  <th className="py-3 px-4 text-center">Poin Reward</th>
                  <th className="py-3 px-4 text-right">Total Transaksi Belanja</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                {customers.data.length > 0 ? (
                  customers.data.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                        <User size={14} className="text-teal-600" />
                        <Link href={route('admin.customers.show', c.id)} className="hover:text-teal-600 hover:underline">
                          {c.name}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{c.phone || '-'}</td>
                      <td className="py-3.5 px-4 text-slate-500">{c.email || '-'}</td>
                      <td className="py-3.5 px-4">{getTierBadge(c.tier)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                          <Gift size={10} />
                          {c.points} Pts
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatCurrency(c.total_spent)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link
                            href={route('admin.customers.edit', c.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </Link>
                          <button
                            onClick={() => handleDelete(c.id)}
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
                      Data pelanggan tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            paginator={customers}
            filters={filters}
            routeName="admin.customers.index"
            entityName="pelanggan"
            color="teal"
          />
        </div>
      </div>
    </AppLayout>
  );
}
