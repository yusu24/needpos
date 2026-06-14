import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import {
  ShoppingCart, TrendingUp, Package, Users,
  ArrowRight, BarChart3, Clock, CheckCircle,
  AlertTriangle, Star, Zap, Receipt
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color = 'indigo', trend }) {
  const colors = {
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' },
  };
  const c = colors[color] || colors.indigo;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${c.bg} border ${c.border}`}>
          <Icon size={18} className={c.text} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 leading-tight">{value}</p>
        <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, title, desc, href, color = 'indigo' }) {
  const colors = {
    indigo: 'from-indigo-600 to-indigo-700 hover:from-indigo-500',
    emerald: 'from-emerald-600 to-emerald-700 hover:from-emerald-500',
    amber: 'from-amber-500 to-amber-600 hover:from-amber-400',
    slate: 'from-slate-700 to-slate-800 hover:from-slate-600',
  };

  return (
    <Link
      href={href}
      className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br ${colors[color] || colors.indigo} text-white shadow-md hover:shadow-lg transition-all duration-200 group`}
    >
      <div className="p-2.5 bg-white/15 rounded-xl shrink-0">
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm">{title}</h3>
        <p className="text-[11px] text-white/70 truncate">{desc}</p>
      </div>
      <ArrowRight size={16} className="opacity-60 group-hover:translate-x-1 transition-transform duration-200 shrink-0" />
    </Link>
  );
}

export default function Dashboard({ stats = {}, recentOrders = [], lowStockProducts = [] }) {
  const { auth } = usePage().props;
  const user = auth.user;
  const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : 'user';
  const isOwnerOrManager = ['owner', 'manager'].includes(userRole);
  const isCashier = userRole === 'cashier';

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 17 ? 'Selamat siang' : 'Selamat malam';

  const formatCurrency = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);

  return (
    <AppLayout header="Dashboard">
      <Head title="Dashboard — NeedPOS" />

      <div className="flex flex-col gap-4">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-5 text-white shadow-lg">
          {/* decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-indigo-600/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -left-6 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-indigo-300 text-sm font-medium mb-1">
                {greeting}, 👋
              </p>
              <h2 className="text-2xl font-extrabold leading-tight">{user.name}</h2>
              <p className="text-slate-400 text-sm mt-1 capitalize">
                Role: <span className="text-indigo-300 font-semibold">{userRole}</span>
                {user.outlet && (
                  <> · Outlet: <span className="text-indigo-300 font-semibold">{user.outlet.name}</span></>
                )}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/10 border border-white/10 rounded-2xl px-4 py-3">
              <Clock size={16} className="text-indigo-300" />
              <span className="text-sm font-medium text-white/80">
                {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Quick link if cashier role */}
          {isCashier && (
            <Link
              href={route('kasir.index')}
              className="relative z-10 mt-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors duration-200 shadow-md"
            >
              <Zap size={16} />
              Buka Kasir POS
              <ArrowRight size={14} className="ml-1" />
            </Link>
          )}
        </div>

        {/* Stats Grid - only for owner/manager */}
        {isOwnerOrManager && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              icon={Receipt}
              label="Transaksi Hari Ini"
              value={stats.orders_today ?? '—'}
              sub="total transaksi"
              color="indigo"
              trend={stats.orders_trend}
            />
            <StatCard
              icon={TrendingUp}
              label="Omzet Hari Ini"
              value={stats.revenue_today ? formatCurrency(stats.revenue_today) : 'Rp 0'}
              sub="total penjualan"
              color="emerald"
              trend={stats.revenue_trend}
            />
            <StatCard
              icon={Package}
              label="Produk Aktif"
              value={stats.products_count ?? '—'}
              sub="produk tersedia"
              color="amber"
            />
            <StatCard
              icon={Users}
              label="Kasir Aktif"
              value={stats.users_count ?? '—'}
              sub="pengguna terdaftar"
              color="rose"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Akses Cepat</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {(isOwnerOrManager || isCashier) && (
              <QuickAction
                icon={ShoppingCart}
                title="Kasir POS"
                desc="Mulai sesi penjualan"
                href={route('kasir.index')}
                color="indigo"
              />
            )}
            {isOwnerOrManager && (
              <>
                <QuickAction
                  icon={Package}
                  title="Kelola Produk"
                  desc="Tambah atau edit produk"
                  href={route('admin.products.index')}
                  color="emerald"
                />
                <QuickAction
                  icon={BarChart3}
                  title="Lihat Laporan"
                  desc="Analisis penjualan"
                  href={route('admin.reports.index')}
                  color="amber"
                />
                <QuickAction
                  icon={Receipt}
                  title="Riwayat Transaksi"
                  desc="Daftar semua pesanan"
                  href={route('admin.orders.index')}
                  color="slate"
                />
              </>
            )}
          </div>
        </div>

        {/* Bottom section: Recent orders + Low stock */}
        {isOwnerOrManager && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Transaksi Terbaru</h3>
                <Link href={route('admin.orders.index')} className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-1">
                  Lihat semua <ArrowRight size={12} />
                </Link>
              </div>
              <div className="divide-y divide-slate-50">
                {recentOrders.length > 0 ? recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/80 transition-colors">
                    <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                      <Receipt size={14} className="text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">#{order.order_number || order.id}</p>
                      <p className="text-[10px] text-slate-400">{order.cashier?.name || 'Kasir'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-900">{formatCurrency(order.total_amount)}</p>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        <CheckCircle size={9} /> {order.payment_status === 'paid' || order.payment_status === 'paid' ? 'Lunas' : (order.payment_status || 'paid')}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                    <Receipt size={28} className="opacity-30" />
                    <p className="text-xs">Belum ada transaksi hari ini</p>
                  </div>
                )}
              </div>
            </div>

            {/* Low Stock Products */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  Stok Hampir Habis
                </h3>
                <Link href={route('admin.stock.index')} className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-1">
                  Kelola stok <ArrowRight size={12} />
                </Link>
              </div>
              <div className="divide-y divide-slate-50">
                {lowStockProducts.length > 0 ? lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/80 transition-colors">
                    <div className="p-2 bg-amber-50 rounded-lg shrink-0">
                      <Package size={14} className="text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{product.name}</p>
                      <p className="text-[10px] text-slate-400">{product.category?.name || 'Tanpa Kategori'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        (product.stock?.quantity ?? 0) <= 0
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        Sisa: {Math.round(product.stock?.quantity ?? 0)}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                    <Star size={28} className="opacity-30 text-emerald-500" />
                    <p className="text-xs text-emerald-600 font-medium">Semua stok aman! 🎉</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
