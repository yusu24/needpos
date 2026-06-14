import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft } from 'lucide-react';

export default function Form({ supplier = null }) {
  const isEdit = !!supplier;

  const { data, setData, post, patch, processing, errors } = useForm({
    name: supplier?.name || '',
    contact_person: supplier?.contact_person || '',
    phone: supplier?.phone || '',
    email: supplier?.email || '',
    address: supplier?.address || '',
    payment_terms: supplier?.payment_terms || 'COD',
    is_active: supplier?.is_active ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      patch(route('admin.suppliers.update', supplier.id));
    } else {
      post(route('admin.suppliers.store'));
    }
  };

  return (
    <AppLayout header={isEdit ? 'Edit Supplier' : 'Tambah Supplier Baru'}>
      <Head title={isEdit ? 'Edit Supplier' : 'Tambah Supplier'} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Header bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href={route('admin.suppliers.index')}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h2 className="text-sm font-bold text-slate-800">{isEdit ? 'Edit Supplier' : 'Supplier Baru'}</h2>
              <p className="text-xs text-slate-500">Isi detail data vendor di bawah ini.</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={processing}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3.5 rounded-lg text-xs shadow-md shadow-teal-600/10 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            Simpan Supplier
          </button>
        </div>

        {/* General Form Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nama Supplier / Perusahaan *</label>
              <input
                type="text"
                value={data.name}
                onChange={e => setData('name', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                placeholder="Contoh: PT. Sumber Makmur"
              />
              {errors.name && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Contact Person (Nama Penghubung)</label>
              <input
                type="text"
                value={data.contact_person}
                onChange={e => setData('contact_person', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                placeholder="Contoh: Budi Santoso"
              />
              {errors.contact_person && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.contact_person}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">No. Telepon / HP</label>
              <input
                type="text"
                value={data.phone}
                onChange={e => setData('phone', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                placeholder="Contoh: 08123456789"
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
                placeholder="Contoh: supplier@mail.com"
              />
              {errors.email && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Syarat Pembayaran (Payment Terms)</label>
              <input
                type="text"
                value={data.payment_terms}
                onChange={e => setData('payment_terms', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                placeholder="Contoh: COD, NET 30, NET 14"
              />
              {errors.payment_terms && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.payment_terms}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Alamat Lengkap</label>
              <textarea
                value={data.address}
                onChange={e => setData('address', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                rows="3"
                placeholder="Jl. Raya Kemerdekaan No. 45..."
              />
              {errors.address && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.address}</p>}
            </div>

            <div className="flex items-center gap-2 pt-2 md:col-span-2">
              <input
                type="checkbox"
                id="is_active"
                checked={data.is_active}
                onChange={e => setData('is_active', e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
              />
              <label htmlFor="is_active" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
                Supplier Aktif (Bisa dipilih saat membuat Purchase Order)
              </label>
            </div>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
