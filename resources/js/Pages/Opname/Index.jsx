import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Plus, Eye, CheckCircle2, ClipboardList } from 'lucide-react';
import Pagination from '@/Components/Pagination';

export default function Index({ opnames, draftOpname, filters = {} }) {
  const { post, processing } = useForm({
    note: '',
  });

  const handleStartOpname = (e) => {
    e.preventDefault();
    if (confirm('Apakah Anda yakin ingin memulai sesi stock opname baru?')) {
      post(route('admin.stock-opnames.store'));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-amber-50 text-amber-600 border border-amber-100',
      finalized: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    };
    const labels = {
      draft: 'Draft (Sedang Dihitung)',
      finalized: 'Finalized (Selesai)',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${badges[status] || 'bg-slate-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <AppLayout header="Opname Stok Fisik">
      <Head title="Stock Opname" />

      <div className="flex flex-col gap-4">
        {/* Header Bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Daftar Stock Opname</h2>
            <p className="text-xs text-slate-500 font-medium">Lakukan rekonsiliasi data stok fisik vs pencatatan sistem.</p>
          </div>
          
          <div>
            {draftOpname ? (
              <Link
                href={route('admin.stock-opnames.show', draftOpname.id)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-3.5 rounded-lg text-xs shadow-md shadow-amber-600/10 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ClipboardList size={14} />
                Lanjutkan Sesi Draft
              </Link>
            ) : (
              <button
                onClick={handleStartOpname}
                disabled={processing}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3.5 rounded-lg text-xs shadow-md shadow-teal-600/10 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus size={14} />
                Mulai Sesi Opname
              </button>
            )}
          </div>
        </div>

        {/* List Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                  <th className="py-3 px-4">ID Sesi</th>
                  <th className="py-3 px-4">Tanggal Mulai</th>
                  <th className="py-3 px-4">Petugas</th>
                  <th className="py-3 px-4">Catatan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                {opnames.data.length > 0 ? (
                  opnames.data.map((op) => (
                    <tr key={op.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                        <ClipboardList size={14} className="text-teal-600" />
                        OPN-{String(op.id).padStart(5, '0')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{new Date(op.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{op.user?.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{op.note || '-'}</td>
                      <td className="py-3.5 px-4 text-center">{getStatusBadge(op.status)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link
                            href={route('admin.stock-opnames.show', op.id)}
                            className="p-1.5 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                          >
                            <Eye size={12} />
                            Buka Detail
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      Belum ada pencatatan stock opname di outlet ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            paginator={opnames}
            filters={filters}
            routeName="admin.stock-opnames.index"
            entityName="opname"
            color="teal"
          />
        </div>
      </div>
    </AppLayout>
  );
}
