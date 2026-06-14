import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PosLayout from '@/Components/Layout/PosLayout';
import ProductGrid from '@/Components/POS/ProductGrid';
import CartPanel from '@/Components/POS/CartPanel';
import PaymentModal from '@/Components/POS/PaymentModal';
import ReceiptModal from '@/Components/POS/ReceiptModal';
import { ShoppingCart, Package, History, BarChart3, Settings } from 'lucide-react';

export default function Index({ categories, products, outlet }) {
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = React.useState(false);
  const [completedOrder, setCompletedOrder] = React.useState(null);

  const taxRate = outlet ? parseFloat(outlet.tax_rate) : 11;

  const handleCheckoutSuccess = (order) => {
    setCompletedOrder(order);
    setIsPaymentOpen(false);
    setIsReceiptOpen(true);
  };

  return (
    <PosLayout>
      <Head title="Kasir POS" />

      {/* Main POS Container (Teal Style Grid) */}
      <div className="pos-wrap w-full">
        {/* Left Teal Sidebar */}
        <nav className="sidebar shrink-0 select-none" role="navigation" aria-label="Menu utama">
          <div className="text-white font-black text-[10px] tracking-widest mb-4 opacity-75 uppercase">POS</div>
          
          <Link href={route('kasir.index')} className="sidebar-btn active" title="Kasir">
            <ShoppingCart size={18} />
            <span className="sidebar-label">Kasir</span>
          </Link>
          
          <Link href={route('admin.products.index')} className="sidebar-btn" title="Produk">
            <Package size={18} />
            <span className="sidebar-label">Produk</span>
          </Link>
          
          <Link href={route('admin.orders.index')} className="sidebar-btn" title="Riwayat">
            <History size={18} />
            <span className="sidebar-label">Riwayat</span>
          </Link>
          
          <Link href={route('admin.reports.index')} className="sidebar-btn" title="Laporan">
            <BarChart3 size={18} />
            <span className="sidebar-label">Laporan</span>
          </Link>
          
          <div className="flex-grow" />
          
          <Link href={route('profile.edit')} className="sidebar-btn" title="Pengaturan">
            <Settings size={18} />
            <span className="sidebar-label">Setting</span>
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

