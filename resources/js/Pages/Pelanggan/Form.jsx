import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft } from 'lucide-react';

export default function Form({ customer = null }) {
  const isEdit = !!customer;

  const { data, setData, post, patch, processing, errors } = useForm({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    tier: customer?.tier || 'regular',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      patch(route('admin.customers.update', customer.id));
    } else {
      post(route('admin.customers.store'));
    }
  };

  return (
    <AppLayout header={isEdit ? 'Edit Pelanggan' : 'Daftarkan Member Baru'}>
      <Head title={isEdit ? 'Edit Pelanggan' : 'Registrasi Member'} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Header bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href={route('admin.customers.index')}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h2 className="text-sm font-bold text-slate-800">{isEdit ? 'Edit Member' : 'Member Baru'}</h2>
              <p className="text-xs text-slate-500">Lengkapi formulir pendaftaran member loyalitas pelanggan.</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={processing}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3.5 rounded-lg text-xs shadow-md shadow-teal-600/10 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            Simpan Pelanggan
          </button>
        </div>

        {/* General Form Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nama Lengkap *</label>
              <input
                type="text"
                value={data.name}
                onChange={e => setData('name', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium"
                placeholder="Contoh: Andi Wijaya"
              />
              {errors.name && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">No. Telepon / HP</label>
              <input
                type="text"
                value={data.phone}
                onChange={e => setData('phone', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                placeholder="Contoh: 0812XXXXXXXX"
              />
              {errors.phone && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
              <input
                type="email"
                value={data.email}
                onChange={e => setData('email', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                placeholder="Contoh: customer@mail.com"
              />
              {errors.email && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Loyalty Level (Tier)</label>
              <select
                value={data.tier}
                onChange={e => setData('tier', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all cursor-pointer font-semibold"
              >
                <option value="regular">Regular</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
              </select>
              {errors.tier && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.tier}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Alamat Tempat Tinggal</label>
              <textarea
                value={data.address}
                onChange={e => setData('address', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                rows="3"
                placeholder="Jl. Mawar Indah Blok B3 No. 12..."
              />
              {errors.address && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.address}</p>}
            </div>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
