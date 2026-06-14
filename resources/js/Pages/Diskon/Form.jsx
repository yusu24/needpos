import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Percent } from 'lucide-react';

export default function Form({ discount }) {
  const isEdit = !!discount;

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const { data, setData, post, patch, processing, errors } = useForm({
    code: discount?.code || '',
    name: discount?.name || '',
    type: discount?.type || 'percentage',
    value: discount?.value || '',
    min_purchase: discount?.min_purchase || 0,
    max_uses: discount?.max_uses || '',
    is_active: isEdit ? !!discount.is_active : true,
    starts_at: formatDateForInput(discount?.starts_at) || '',
    expires_at: formatDateForInput(discount?.expires_at) || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      patch(route('admin.discounts.update', discount.id));
    } else {
      post(route('admin.discounts.store'));
    }
  };

  return (
    <AppLayout header={isEdit ? `Edit Diskon: ${discount.code}` : 'Buat Diskon Baru'}>
      <Head title={isEdit ? 'Edit Diskon' : 'Buat Diskon'} />

      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link
          href={route('admin.discounts.index')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft size={14} />
          Kembali ke Daftar Diskon
        </Link>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Percent size={16} className="text-indigo-600" />
              Detail Aturan Diskon
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Kode Promo (Kapital/Kode) *</label>
                <input
                  type="text"
                  value={data.code}
                  onChange={e => setData('code', e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono font-bold text-indigo-700"
                  placeholder="Contoh: PROMO10, DISKONHEMAT"
                />
                {errors.code && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.code}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nama Kampanye Promo *</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  placeholder="Contoh: Diskon Kemerdekaan, Promo Weekend"
                />
                {errors.name && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tipe Diskon *</label>
                <select
                  value={data.type}
                  onChange={e => setData('type', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="percentage">Persentase (%)</option>
                  <option value="flat">Potongan Harga Tetap (Nominal)</option>
                  <option value="bogo">BOGO (Buy 1 Get 1)</option>
                </select>
                {errors.type && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.type}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nilai Diskon *</label>
                <div className="relative">
                  {data.type === 'percentage' && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                  )}
                  {data.type === 'flat' && (
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  )}
                  <input
                    type="number"
                    value={data.value}
                    disabled={data.type === 'bogo'}
                    onChange={e => setData('value', e.target.value)}
                    className={`w-full py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold ${
                      data.type === 'flat' ? 'pl-9 pr-3.5' : 'pl-3.5 pr-8'
                    } disabled:opacity-50`}
                    placeholder={data.type === 'bogo' ? 'BOGO' : '0'}
                  />
                </div>
                {errors.value && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.value}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Minimum Pembelian (Subtotal)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={data.min_purchase}
                    onChange={e => setData('min_purchase', e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold text-slate-700"
                    placeholder="0"
                  />
                </div>
                {errors.min_purchase && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.min_purchase}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Batasan Kuota Penggunaan (Maksimal)</label>
                <input
                  type="number"
                  value={data.max_uses}
                  onChange={e => setData('max_uses', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  placeholder="Kosongkan jika tidak dibatasi"
                />
                {errors.max_uses && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.max_uses}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tanggal Mulai Berlaku</label>
                <input
                  type="date"
                  value={data.starts_at}
                  onChange={e => setData('starts_at', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
                {errors.starts_at && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.starts_at}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tanggal Berakhir (Expired)</label>
                <input
                  type="date"
                  value={data.expires_at}
                  onChange={e => setData('expires_at', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
                {errors.expires_at && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.expires_at}</p>}
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">Status Aktif Diskon</span>
                <span className="text-[10px] text-slate-400">Nonaktifkan untuk menangguhkan penggunaan kupon</span>
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
              href={route('admin.discounts.index')}
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
              {isEdit ? 'Simpan Perubahan' : 'Buat Diskon'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
