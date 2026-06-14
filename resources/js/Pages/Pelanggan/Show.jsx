import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Gift, Award, Calendar, Receipt, DollarSign } from 'lucide-react';

export default function Show({ customer }) {
  const getTierBadge = (tier) => {
    const badges = {
      regular: 'bg-slate-100 text-slate-600 border border-slate-200',
      silver: 'bg-zinc-100 text-zinc-700 border border-zinc-300',
      gold: 'bg-amber-50 text-amber-600 border border-amber-200',
    };
    const labels = {
      regular: 'Regular Member',
      silver: 'Silver Member',
      gold: 'Gold Member',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${badges[tier] || 'bg-slate-100'}`}>
        <Award size={12} />
        {labels[tier] || tier}
      </span>
    );
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <AppLayout header="Profil Pelanggan">
      <Head title={`Pelanggan: ${customer.name}`} />

      <div className="flex flex-col gap-4">
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
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800">{customer.name}</h2>
                {getTierBadge(customer.tier)}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Terdaftar sejak {new Date(customer.joined_at).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
          <Link
            href={route('admin.customers.edit', customer.id)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3.5 rounded-lg text-xs border border-slate-200 transition-colors"
          >
            Edit Profil
          </Link>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Detailed Info Card */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Purchase History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase">Riwayat Pembelian Terbaru</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                      <th className="py-2.5 px-4">No. Invoice</th>
                      <th className="py-2.5 px-4">Tanggal Pembelian</th>
                      <th className="py-2.5 px-4 text-center">Metode Bayar</th>
                      <th className="py-2.5 px-4 text-right">Total Belanja</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                    {customer.orders?.length > 0 ? (
                      customer.orders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-1.5">
                            <Receipt size={13} className="text-slate-400" />
                            {order.order_number}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            <span className="flex items-center gap-1 text-[10px]">
                              <Calendar size={10} className="text-slate-400" />
                              {new Date(order.created_at).toLocaleString('id-ID')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-slate-600 uppercase font-mono text-[10px]">{order.payment_method}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">{formatCurrency(order.total_amount)}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              order.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : 'bg-rose-50 text-rose-600 border border-rose-100'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-400">
                          Belum ada riwayat transaksi belanja untuk member ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Stats & Details Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Contact Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
              <h3 className="text-xs font-bold text-slate-800 mb-3 tracking-wider uppercase border-b border-slate-100 pb-2">Kontak & Alamat</h3>
              <div className="flex flex-col gap-2 text-xs">
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase">No. Handphone</span>
                  <span className="font-semibold text-slate-700">{customer.phone || '-'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase">Alamat Email</span>
                  <span className="font-semibold text-slate-700">{customer.email || '-'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase">Alamat</span>
                  <span className="font-semibold text-slate-700">{customer.address || '-'}</span>
                </div>
              </div>
            </div>

            {/* Loyalty Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase border-b border-slate-100 pb-2">Statistik Loyalitas</h3>
              
              <div className="flex justify-between items-center text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                <span className="flex items-center gap-1 font-semibold text-amber-700">
                  <Gift size={12} />
                  Poin Saat Ini
                </span>
                <span className="font-bold text-amber-600 text-sm">{customer.points} Pts</span>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-600 bg-teal-50/50 p-2.5 rounded-lg border border-teal-100">
                <span className="flex items-center gap-1 font-semibold text-teal-700">
                  <DollarSign size={12} />
                  Akumulasi Belanja
                </span>
                <span className="font-bold text-teal-600 text-sm">{formatCurrency(customer.total_spent)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
