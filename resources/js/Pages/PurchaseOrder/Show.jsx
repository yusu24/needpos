import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Send, CheckCircle2, XCircle, Truck, FileText } from 'lucide-react';

export default function Show({ purchaseOrder }) {
  const { post, processing } = useForm();

  const handleUpdateStatus = (status) => {
    if (confirm(`Apakah Anda yakin ingin mengubah status PO menjadi ${status.toUpperCase()}?`)) {
      post(route('admin.purchase-orders.status', purchaseOrder.id), {
        data: { status },
      });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-slate-100 text-slate-600 border border-slate-200',
      sent: 'bg-blue-50 text-blue-600 border border-blue-100',
      partial: 'bg-amber-50 text-amber-600 border border-amber-100',
      received: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      cancelled: 'bg-rose-50 text-rose-600 border border-rose-100',
    };
    const labels = {
      draft: 'Draft',
      sent: 'Dikirim ke Supplier',
      partial: 'Diterima Sebagian',
      received: 'Diterima Lengkap',
      cancelled: 'Dibatalkan',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${badges[status] || 'bg-slate-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <AppLayout header="Detail Purchase Order">
      <Head title={`PO: ${purchaseOrder.po_number}`} />

      <div className="flex flex-col gap-4">
        {/* Header bar */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href={route('admin.purchase-orders.index')}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800">No. PO: {purchaseOrder.po_number}</h2>
                {getStatusBadge(purchaseOrder.status)}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Dibuat tanggal {new Date(purchaseOrder.created_at).toLocaleDateString('id-ID')} oleh {purchaseOrder.user?.name}
              </p>
            </div>
          </div>

          {/* Action buttons based on status */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {purchaseOrder.status === 'draft' && (
              <>
                <button
                  onClick={() => handleUpdateStatus('sent')}
                  disabled={processing}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3.5 rounded-lg text-xs shadow-md shadow-blue-600/10 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send size={12} />
                  Kirim PO
                </button>
                <button
                  onClick={() => handleUpdateStatus('cancelled')}
                  disabled={processing}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-2 px-3.5 rounded-lg text-xs border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <XCircle size={12} />
                  Batalkan PO
                </button>
              </>
            )}

            {purchaseOrder.status === 'sent' && (
              <>
                <Link
                  href={route('admin.purchase-receives.create', purchaseOrder.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3.5 rounded-lg text-xs shadow-md shadow-emerald-600/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Truck size={12} />
                  Terima Barang
                </Link>
                <button
                  onClick={() => handleUpdateStatus('cancelled')}
                  disabled={processing}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-2 px-3.5 rounded-lg text-xs border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <XCircle size={12} />
                  Batalkan PO
                </button>
              </>
            )}

            {purchaseOrder.status === 'partial' && (
              <Link
                href={route('admin.purchase-receives.create', purchaseOrder.id)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3.5 rounded-lg text-xs shadow-md shadow-emerald-600/10 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Truck size={12} />
                Terima Sisa Barang
              </Link>
            )}
          </div>
        </div>

        {/* PO Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Items Table Card */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase">Detail Barang Yang Dipesan</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                      <th className="py-2.5 px-4">Nama Produk</th>
                      <th className="py-2.5 px-4 text-center">Qty Dipesan</th>
                      <th className="py-2.5 px-4 text-center">Qty Diterima</th>
                      <th className="py-2.5 px-4 text-right">Harga Beli</th>
                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                    {purchaseOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">{item.product_name}</span>
                          <span className="text-[10px] text-slate-400">SKU: {item.product?.sku || '-'}</span>
                        </td>
                        <td className="py-3 px-4 text-center">{parseFloat(item.ordered_qty)} {item.product?.unit || 'pcs'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            parseFloat(item.received_qty) >= parseFloat(item.ordered_qty)
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : parseFloat(item.received_qty) > 0
                              ? 'bg-amber-50 text-amber-600 border border-amber-100'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {parseFloat(item.received_qty)} {item.product?.unit || 'pcs'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="py-3 px-4 text-right font-bold">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Receive Logs */}
            {purchaseOrder.receives?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
                <h3 className="text-xs font-bold text-slate-800 mb-4 tracking-wider uppercase border-b border-slate-100 pb-2">Log Penerimaan Barang</h3>
                
                <div className="space-y-4">
                  {purchaseOrder.receives.map((rec) => (
                    <div key={rec.id} className="border border-slate-200/50 rounded-lg p-3 bg-slate-50/50">
                      <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-1.5">
                        <span className="font-bold text-slate-950 text-xs">{rec.receive_number}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Diterima pada {new Date(rec.received_at).toLocaleString('id-ID')} oleh {rec.user?.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mb-2 font-medium">Catatan: {rec.note || '-'}</div>

                      <div className="space-y-1">
                        {rec.items?.map((item) => (
                          <div key={item.id} className="flex justify-between text-[10px] text-slate-500 font-semibold px-2 py-0.5 bg-white rounded border border-slate-100">
                            <span>{item.product?.name}</span>
                            <span>{parseFloat(item.qty_received)} pcs x {formatCurrency(item.unit_price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PO Summary Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Supplier Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
              <h3 className="text-xs font-bold text-slate-800 mb-3 tracking-wider uppercase border-b border-slate-100 pb-2">Supplier</h3>
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="font-bold text-slate-900">{purchaseOrder.supplier?.name}</div>
                <div className="text-slate-500">CP: {purchaseOrder.supplier?.contact_person || '-'}</div>
                <div className="text-slate-500">HP: {purchaseOrder.supplier?.phone || '-'}</div>
                <div className="text-slate-500">Syarat Bayar: {purchaseOrder.supplier?.payment_terms || 'COD'}</div>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase border-b border-slate-100 pb-2">Ringkasan PO</h3>
              
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">{formatCurrency(purchaseOrder.subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Pajak (PPN 11%)</span>
                <span className="font-semibold text-slate-800">{formatCurrency(purchaseOrder.tax_amount)}</span>
              </div>

              <div className="border-t border-dashed border-slate-100 pt-3 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Total Tagihan PO</span>
                <span className="font-extrabold text-teal-600 text-sm">{formatCurrency(purchaseOrder.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
