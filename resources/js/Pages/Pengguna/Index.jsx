import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Edit2, Trash2, Users, ShieldAlert } from 'lucide-react';

export default function Index({ users, filters }) {
  const [search, setSearch] = React.useState(filters.search || '');

  // Debounced search
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      router.get(route('admin.users.index'), { search: search }, {
        preserveState: true,
        replace: true
      });
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini? Karyawan ini tidak akan bisa login lagi.')) {
      router.delete(route('admin.users.destroy', id));
    }
  };

  const getRoleBadge = (roleName) => {
    switch (roleName) {
      case 'owner':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wider">
            Owner
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
            Manager
          </span>
        );
      case 'cashier':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
            Kasir
          </span>
        );
      case 'stock_admin':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
            Stok Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
            {roleName}
          </span>
        );
    }
  };

  return (
    <AppLayout header="Manajemen Karyawan">
      <Head title="Manajemen Pengguna" />

      {/* Action / Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200/80 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
            placeholder="Cari karyawan berdasarkan nama atau email..."
          />
        </div>

        <Link
          href={route('admin.users.create')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-5 rounded-2xl text-xs shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} />
          Tambah Karyawan
        </Link>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                <th className="py-4 px-5">Nama Karyawan</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4 text-center">Hak Akses (Role)</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-5 text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
              {users.data.length > 0 ? (
                users.data.map(user => {
                  const roleName = user.roles && user.roles.length > 0 ? user.roles[0].name : 'user';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name with initials */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-indigo-500 font-bold flex items-center justify-center shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 text-sm">{user.name}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 text-slate-500">
                        {user.email}
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4 text-center">
                        {getRoleBadge(roleName)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.is_active 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {user.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link
                            href={route('admin.users.edit', user.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Karyawan"
                          >
                            <Edit2 size={13} />
                          </Link>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Karyawan"
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
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-1.5">
                      <Users size={28} className="text-slate-300" />
                      <span>Belum ada karyawan terdaftar.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {users.links && users.links.length > 3 && (
          <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Menampilkan {users.from}-{users.to} dari {users.total} pengguna
            </span>
            <div className="flex gap-1">
              {users.links.map((link, idx) => (
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
