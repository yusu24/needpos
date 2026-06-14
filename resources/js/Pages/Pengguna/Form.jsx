import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Users } from 'lucide-react';

export default function Form({ userMember, roles }) {
  const isEdit = !!userMember;

  const getRoleNameFromUser = (user) => {
    if (!user || !user.roles || user.roles.length === 0) return '';
    return user.roles[0].name;
  };

  const { data, setData, post, patch, processing, errors } = useForm({
    name: userMember?.name || '',
    email: userMember?.email || '',
    password: '',
    is_active: isEdit ? !!userMember.is_active : true,
    role: getRoleNameFromUser(userMember) || 'cashier',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      patch(route('admin.users.update', userMember.id));
    } else {
      post(route('admin.users.store'));
    }
  };

  return (
    <AppLayout header={isEdit ? `Edit Karyawan: ${userMember.name}` : 'Tambah Karyawan Baru'}>
      <Head title={isEdit ? 'Edit Karyawan' : 'Tambah Karyawan'} />

      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link
          href={route('admin.users.index')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft size={14} />
          Kembali ke Daftar Karyawan
        </Link>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Users size={16} className="text-indigo-600" />
              Profil Karyawan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nama Lengkap *</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  placeholder="Ketik nama karyawan"
                />
                {errors.name && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Alamat Email *</label>
                <input
                  type="email"
                  value={data.email}
                  onChange={e => setData('email', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  placeholder="karyawan@outlet.com"
                />
                {errors.email && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Hak Akses / Jabatan (Role) *</label>
                <select
                  value={data.role}
                  onChange={e => setData('role', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer capitalize"
                >
                  <option value="owner">Owner (Full Akses)</option>
                  <option value="manager">Manager (Admin Toko)</option>
                  <option value="cashier">Kasir (Transaksi)</option>
                  <option value="stock_admin">Stock Admin (Pengelola Stok)</option>
                </select>
                {errors.role && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.role}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Kata Sandi (Password) {isEdit ? '(Kosongkan jika tidak diubah)' : '*'}
                </label>
                <input
                  type="password"
                  value={data.password}
                  onChange={e => setData('password', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono"
                  placeholder="Ketik password minimal 8 karakter"
                />
                {errors.password && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.password}</p>}
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">Status Akun Aktif</span>
                <span className="text-[10px] text-slate-400">Nonaktifkan untuk memblokir akses login karyawan</span>
              </div>
              <input
                type="checkbox"
                checked={data.is_active}
                onChange={e => setData('is_active', e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end">
            <Link
              href={route('admin.users.index')}
              className="bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-5 rounded-2xl text-xs border border-slate-200 transition-colors cursor-pointer"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-2xl text-xs shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check size={14} />
              {isEdit ? 'Simpan Perubahan' : 'Daftarkan Karyawan'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
