import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PosLayout from '@/Components/Layout/PosLayout';
import ProductGrid from '@/Components/POS/ProductGrid';
import CartPanel from '@/Components/POS/CartPanel';
import PaymentModal from '@/Components/POS/PaymentModal';
import ReceiptModal from '@/Components/POS/ReceiptModal';
import { ShoppingCart, Package, History, Store, LayoutDashboard, LogOut } from 'lucide-react';

export default function Index({ categories, products, outlet }) {
  const { auth } = usePage().props;
  const user = auth.user;

  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = React.useState(false);
  const [completedOrder, setCompletedOrder] = React.useState(null);

  const taxRate = outlet ? parseFloat(outlet.tax_rate) : 11;

  const handleCheckoutSuccess = (order) => {
    setCompletedOrder(order);
    setIsPaymentOpen(false);
    setIsReceiptOpen(true);
  };

  const hasPermission = (permission) => {
    if (!permission) return true;
    if (!user || !user.permissions_list) return false;
    // Owner bypasses all permissions
    if (user.roles_list && user.roles_list.includes('owner')) return true;
    return user.permissions_list.includes(permission);
  };

  return (
    <PosLayout>
      <Head title="Kasir POS" />

      {/* Main POS Container (Teal Style Grid) */}
      <div className="pos-wrap w-full">
        {/* Left Sidebar (Dark Slate Theme) */}
        <nav className="sidebar shrink-0 select-none" role="navigation" aria-label="Menu utama">
          {/* Outlet Icon replacing POS text */}
          <div className="flex flex-col items-center justify-center p-2 mb-4 bg-slate-900 border border-slate-800 rounded-xl text-indigo-400 shadow-md shadow-slate-950/50" title={outlet ? outlet.name : 'Outlet'}>
            <Store size={22} />
          </div>
          
          {hasPermission('view dashboard') && (
            <Link href={route('dashboard')} className="sidebar-btn" title="Dashboard">
              <LayoutDashboard size={18} />
              <span className="sidebar-label">Dashboard</span>
            </Link>
          )}
          
          {hasPermission('view pos') && (
            <Link href={route('kasir.index')} className="sidebar-btn active" title="Kasir">
              <ShoppingCart size={18} />
              <span className="sidebar-label">Kasir</span>
            </Link>
          )}
          
          {hasPermission('view products') && (
            <Link href={route('admin.products.index')} className="sidebar-btn" title="Produk">
              <Package size={18} />
              <span className="sidebar-label">Produk</span>
            </Link>
          )}
          
          {hasPermission('view transactions') && (
            <Link href={route('admin.orders.index')} className="sidebar-btn" title="Riwayat">
              <History size={18} />
              <span className="sidebar-label">Riwayat</span>
            </Link>
          )}
          
          <div className="flex-grow" />
          
          <Link href={route('logout')} method="post" as="button" className="sidebar-btn text-slate-400 hover:text-rose-400 transition-colors" title="Keluar">
            <LogOut size={18} />
            <span className="sidebar-label">Keluar</span>
          </Link>
        </nav>

        {/* Middle Main Area (Catalog & Filters) */}
        <main className="main-area">
          <ProductGrid products={products} categories={categories} />
        </main>

        {/* Right Sidebar (Cart panel) */}
        <CartPanel 
          onCheckout={() => setIsPaymentOpen(true)} 
          taxRate={taxRate} 
        />
      </div>

      {/* Payment Selection Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handleCheckoutSuccess}
        taxRate={taxRate}
      />

      {/* Post-Checkout Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        order={completedOrder}
        onClose={() => setIsReceiptOpen(false)}
      />
    </PosLayout>
  );
}

