import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Save, Store, Info, Percent, Gift } from 'lucide-react';

export default function Index({ outlet }) {
  const { data, setData, post, processing, errors } = useForm({
    name: outlet.name || '',
    phone: outlet.phone || '',
    address: outlet.address || '',
    tax_rate: parseFloat(outlet.tax_rate) || 11.0,
    receipt_footer: outlet.receipt_footer || '',
    points_ratio: outlet.points_ratio || 10000,
    logo_file: null,
    _method: 'POST', // standard override for file uploads in Laravel
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.settings.update'));
  };

  return (
    <AppLayout header="Pengaturan Toko & Outlet">
      <Head title="Pengaturan Toko" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Header bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-600 rounded-lg text-white">
              <Store size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Pengaturan Outlet</h2>
              <p className="text-xs text-slate-500">Konfigurasi nama toko, pajak PPN, logo, dan skema poin reward pelanggan.</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={processing}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3.5 rounded-lg text-xs shadow-md shadow-teal-600/10 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            Simpan Pengaturan
          </button>
        </div>

        {/* Form Body Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left: General Settings (Main block) */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase border-b border-slate-100 pb-2">Profil Toko</h3>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nama Toko / Outlet *</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium"
                />
                {errors.name && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">No. Telepon Toko</label>
                  <input
                    type="text"
                    value={data.phone}
                    onChange={e => setData('phone', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                  {errors.phone && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tarif Pajak PPN (%) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={data.tax_rate}
                      onChange={e => setData('tax_rate', parseFloat(e.target.value) || 0)}
                      className="w-full pl-3 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 text-xs font-bold">
                      %
                    </span>
                  </div>
                  {errors.tax_rate && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.tax_rate}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Alamat Toko</label>
                <textarea
                  value={data.address}
                  onChange={e => setData('address', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  rows="3"
                />
                {errors.address && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.address}</p>}
              </div>
            </div>

            {/* Receipt template settings */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase border-b border-slate-100 pb-2">Format Struk Penjualan</h3>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Catatan Kaki Struk (Receipt Footer)</label>
                <textarea
                  value={data.receipt_footer}
                  onChange={e => setData('receipt_footer', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  rows="3"
                  placeholder="Contoh: Terima kasih atas kunjungan Anda. Barang yang sudah dibeli tidak dapat ditukar/dikembalikan."
                />
                {errors.receipt_footer && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.receipt_footer}</p>}
              </div>
            </div>
          </div>

          {/* Right: Points Rewards & logo block */}
          <div className="md:col-span-1 flex flex-col gap-4">
            {/* Logo card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase border-b border-slate-100 pb-2">Logo Struk</h3>
              
              {outlet.logo ? (
                <div className="w-24 h-24 mx-auto rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center bg-slate-50">
                  <img src={`/storage/${outlet.logo}`} alt="Logo Toko" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-24 h-24 mx-auto rounded-lg border border-dashed border-slate-200 flex items-center justify-center bg-slate-50 text-[10px] text-slate-400 font-bold uppercase">
                  No Logo
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Upload Logo Baru</label>
                <input
                  type="file"
                  onChange={e => setData('logo_file', e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                />
                {errors.logo_file && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.logo_file}</p>}
              </div>
            </div>

            {/* Points Config card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase border-b border-slate-100 pb-2">Program Loyalitas</h3>
              
              <div className="bg-teal-50 border border-teal-100 p-3 rounded-lg flex items-start gap-2 text-[10px] text-teal-800 font-semibold leading-relaxed">
                <Gift size={16} className="text-teal-600 shrink-0 mt-0.5" />
                Sistem memberikan 1 poin reward untuk setiap kelipatan jumlah nominal belanja yang Anda konfigurasikan di bawah ini.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nilai Belanja Per 1 Poin (IDR) *</label>
                <div className="relative">
                  <input
                    type="number"
                    value={data.points_ratio}
                    onChange={e => setData('points_ratio', parseInt(e.target.value) || 10000)}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-mono font-semibold"
                  />
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 text-xs font-bold font-mono">
                    Rp
                  </span>
                </div>
                {errors.points_ratio && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.points_ratio}</p>}
              </div>
            </div>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
