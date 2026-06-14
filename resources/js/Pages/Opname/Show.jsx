import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function Show({ opname }) {
  const isDraft = opname.status === 'draft';

  const { data, setData, post, processing, errors } = useForm({
    items: opname.items.map(item => ({
      product_id: item.product_id,
      product_name: item.product?.name || item.product_name,
      system_qty: parseFloat(item.system_qty),
      physical_qty: parseFloat(item.physical_qty),
      difference: parseFloat(item.difference),
    })),
  });

  const handlePhysicalQtyChange = (index, value) => {
    const newItems = [...data.items];
    const physicalQty = parseFloat(value) || 0;
    const systemQty = newItems[index].system_qty;
    
    newItems[index].physical_qty = physicalQty;
    newItems[index].difference = physicalQty - systemQty;
    
    setData('items', newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (confirm('Apakah Anda yakin ingin memfinalisasi opname ini? Stok sistem akan disesuaikan secara permanen dan tidak dapat diedit lagi.')) {
      post(route('admin.stock-opnames.finalize', opname.id));
    }
  };

  return (
    <AppLayout header={`Sesi Stock Opname: OPN-${String(opname.id).padStart(5, '0')}`}>
      <Head title={`Stock Opname Detail`} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Header bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href={route('admin.stock-opnames.index')}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800">Sesi OPN-{String(opname.id).padStart(5, '0')}</h2>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                  isDraft
                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  {opname.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Dimulai oleh {opname.user?.name} pada {new Date(opname.created_at).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>

          {isDraft && (
            <button
              type="submit"
              disabled={processing}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3.5 rounded-lg text-xs shadow-md shadow-teal-600/10 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 animate-pulse"
            >
              <CheckCircle2 size={14} />
              Finalisasi Penyesuaian
            </button>
          )}
        </div>

        {errors.error && (
          <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold">
            {errors.error}
          </div>
        )}

        {/* Warning card for Draft status */}
        {isDraft && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-800 flex items-center gap-2.5">
            <ShieldAlert size={18} className="text-amber-600 shrink-0" />
            <div>
              <span className="font-bold block mb-0.5">Peringatan Mode Opname</span>
              Masukkan jumlah kuantitas fisik produk saat ini yang Anda hitung secara manual. Sistem akan secara otomatis menghitung selisih dan melakukan jurnal penyesuaian saat difinalisasi.
            </div>
          </div>
        )}

        {/* Opname Items List Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                  <th className="py-2.5 px-4">Nama Produk</th>
                  <th className="py-2.5 px-4 text-center">Stok Terbaca Sistem</th>
                  <th className="py-2.5 px-4 text-center w-40">Stok Hitung Fisik</th>
                  <th className="py-2.5 px-4 text-center">Selisih Kuantitas</th>
                  <th className="py-2.5 px-4 text-center">Status Selisih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                {isDraft ? (
                  data.items.map((item, index) => (
                    <tr key={item.product_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{item.product_name}</td>
                      <td className="py-3 px-4 text-center text-slate-500">{item.system_qty}</td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          value={item.physical_qty}
                          onChange={e => handlePhysicalQtyChange(index, e.target.value)}
                          className="w-full text-center px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white font-semibold"
                        />
                      </td>
                      <td className={`py-3 px-4 text-center font-bold ${
                        item.difference === 0
                          ? 'text-slate-500'
                          : item.difference > 0
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}>
                        {item.difference > 0 ? `+${item.difference}` : item.difference}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          item.difference === 0
                            ? 'bg-slate-100 text-slate-500'
                            : item.difference > 0
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {item.difference === 0 ? 'Sesuai' : item.difference > 0 ? 'Surplus' : 'Selisih Kurang'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  opname.items.map((item) => {
                    const diff = parseFloat(item.difference);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">{item.product_name}</td>
                        <td className="py-3 px-4 text-center text-slate-500">{parseFloat(item.system_qty)}</td>
                        <td className="py-3 px-4 text-center text-slate-700 font-bold">{parseFloat(item.physical_qty)}</td>
                        <td className={`py-3 px-4 text-center font-bold ${
                          diff === 0
                            ? 'text-slate-500'
                            : diff > 0
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}>
                          {diff > 0 ? `+${diff}` : diff}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            diff === 0
                              ? 'bg-slate-100 text-slate-500'
                              : diff > 0
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            {diff === 0 ? 'Sesuai' : diff > 0 ? 'Surplus' : 'Selisih Kurang'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
