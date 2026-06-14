import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  History, 
  Package, 
  LogOut, 
  User as UserIcon, 
  Store,
  Menu,
  X,
  Tag,
  Percent,
  Users,
  BarChart3,
  Coins,
  Truck,
  ClipboardList,
  Undo2,
  FileText,
  Warehouse,
  Settings,
  ShieldCheck
} from 'lucide-react';

export default function AppLayout({ children, header }) {
  const { auth } = usePage().props;
  const user = auth.user;
  const outlet = user.outlet;

  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Helper to check user permissions
  const hasPermission = (permission) => {
    if (!permission) return true;
    if (!user.permissions_list) return false;
    // Owner bypasses all permissions
    if (user.roles_list && user.roles_list.includes('owner')) return true;
    return user.permissions_list.includes(permission);
  };

  const navItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      href: route('dashboard'),
      active: route().current('dashboard'),
      permission: 'view dashboard'
    },
    {
      name: 'Kasir POS',
      icon: ShoppingCart,
      href: route('kasir.index'),
      active: route().current('kasir.index'),
      permission: 'view pos'
    },
    { type: 'header', name: 'KATALOG' },
    {
      name: 'Kategori',
      icon: Tag,
      href: route('admin.categories.index'),
      active: route().current('admin.categories.index'),
      permission: 'view categories'
    },
    {
      name: 'Produk',
      icon: Package,
      href: route('admin.products.index'),
      active: route().current('admin.products.index') || route().current('admin.products.create') || route().current('admin.products.edit'),
      permission: 'view products'
    },
    {
      name: 'Pricelist',
      icon: Coins,
      href: route('admin.pricelists.index'),
      active: route().current('admin.pricelists.index') || route().current('admin.pricelists.create') || route().current('admin.pricelists.edit'),
      permission: 'view pricelists'
    },
    { type: 'header', name: 'INVENTORI' },
    {
      name: 'Stok Barang',
      icon: Store,
      href: route('admin.stock.index'),
      active: route().current('admin.stock.index') || route().current('admin.stock.movements'),
      permission: 'view stock'
    },
    {
      name: 'Penerimaan Barang',
      icon: Truck,
      href: route('admin.purchase-orders.index'),
      active: route().current('admin.purchase-receives.create'),
      permission: 'view receive items'
    },
    {
      name: 'Opname Stok',
      icon: ClipboardList,
      href: route('admin.stock-opnames.index'),
      active: route().current('admin.stock-opnames.index') || route().current('admin.stock-opnames.show'),
      permission: 'view stock opname'
    },
    {
      name: 'Retur ke Supplier',
      icon: Undo2,
      href: route('admin.supplier-returns.index'),
      active: route().current('admin.supplier-returns.index') || route().current('admin.supplier-returns.create'),
      permission: 'view supplier returns'
    },
    { type: 'header', name: 'PEMBELIAN' },
    {
      name: 'Purchase Order',
      icon: FileText,
      href: route('admin.purchase-orders.index'),
      active: route().current('admin.purchase-orders.index') || route().current('admin.purchase-orders.show') || route().current('admin.purchase-orders.create'),
      permission: 'view purchase orders'
    },
    {
      name: 'Supplier',
      icon: Warehouse,
      href: route('admin.suppliers.index'),
      active: route().current('admin.suppliers.index') || route().current('admin.suppliers.create') || route().current('admin.suppliers.edit'),
      permission: 'view suppliers'
    },
    { type: 'header', name: 'PENJUALAN' },
    {
      name: 'Diskon & Promo',
      icon: Percent,
      href: route('admin.discounts.index'),
      active: route().current('admin.discounts.index') || route().current('admin.discounts.create') || route().current('admin.discounts.edit'),
      permission: 'view discounts'
    },
    {
      name: 'Pelanggan',
      icon: Users,
      href: route('admin.customers.index'),
      active: route().current('admin.customers.index') || route().current('admin.customers.create') || route().current('admin.customers.edit') || route().current('admin.customers.show'),
      permission: 'view customers'
    },
    {
      name: 'Retur Penjualan',
      icon: Undo2,
      href: route('admin.customer-returns.index'),
      active: route().current('admin.customer-returns.index') || route().current('admin.customer-returns.create'),
      permission: 'view customer returns'
    },
    {
      name: 'Transaksi',
      icon: History,
      href: route('admin.orders.index'),
      active: route().current('admin.orders.index') || route().current('admin.orders.show'),
      permission: 'view transactions'
    },
    { type: 'header', name: 'SYSTEM' },
    {
      name: 'Pengguna',
      icon: UserIcon,
      href: route('admin.users.index'),
      active: route().current('admin.users.index') || route().current('admin.users.create') || route().current('admin.users.edit'),
      permission: 'view users'
    },
    {
      name: 'Roles & Permissions',
      icon: ShieldCheck,
      href: route('admin.roles.index'),
      active: route().current('admin.roles.index'),
      permission: 'view roles'
    },
    {
      name: 'Laporan',
      icon: BarChart3,
      href: route('admin.reports.index'),
      active: route().current('admin.reports.index') || route().current('admin.reports.purchases') || route().current('admin.reports.returns') || route().current('admin.reports.profit-loss'),
      permission: 'view reports'
    },
    {
      name: 'Pengaturan',
      icon: Settings,
      href: route('admin.settings.index'),
      active: route().current('admin.settings.index'),
      permission: 'view settings'
    }
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50/50 text-slate-800 font-sans flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-52 h-screen bg-slate-900 text-white border-r border-slate-800 shrink-0">
        {/* Header/Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3 bg-slate-950 shrink-0">
          <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-600/30">
            <Store size={20} />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight tracking-wide">NeedPOS Clone</h1>
            <p className="text-xs text-slate-400 font-medium">{outlet ? outlet.name : 'Demo Outlet'}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto aside-nav">
          {navItems.map((item, index) => {
            if (item.type === 'header') {
              const nextItems = navItems.slice(index + 1);
              let hasSubAccess = false;
              for (const nextItem of nextItems) {
                if (nextItem.type === 'header') break;
                if (hasPermission(nextItem.permission)) {
                  hasSubAccess = true;
                  break;
                }
              }

              if (!hasSubAccess) return null;

              return (
                <div key={index} className="px-3 pt-3 pb-1 text-[10px] font-bold text-slate-500 tracking-wider">
                  {item.name}
                </div>
              );
            }

            const Icon = item.icon;
            const allowed = hasPermission(item.permission);

            if (!allowed) return null;

            return (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  item.active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <Icon size={18} className={`transition-transform duration-200 group-hover:scale-110 ${item.active ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer version info */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/20 text-center shrink-0">
          <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">NeedPOS v1.0.0</p>
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Store size={20} />
            </div>
            <div>
              <h1 className="font-bold text-sm">NeedPOS Clone</h1>
              <p className="text-xs text-slate-400">{outlet ? outlet.name : 'Demo Outlet'}</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto aside-nav">
          {navItems.map((item, index) => {
            if (item.type === 'header') {
              const nextItems = navItems.slice(index + 1);
              let hasSubAccess = false;
              for (const nextItem of nextItems) {
                if (nextItem.type === 'header') break;
                if (hasPermission(nextItem.permission)) {
                  hasSubAccess = true;
                  break;
                }
              }

              if (!hasSubAccess) return null;

              return (
                <div key={index} className="px-3 pt-3 pb-1 text-[10px] font-bold text-slate-500 tracking-wider">
                  {item.name}
                </div>
              );
            }

            const Icon = item.icon;
            const allowed = hasPermission(item.permission);

            if (!allowed) return null;

            return (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  item.active
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer version info */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/20 text-center shrink-0">
          <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">NeedPOS v1.0.0</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm shadow-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-xl md:hidden"
            >
              <Menu size={20} />
            </button>
            
            {header ? (
              <div className="text-lg font-bold text-slate-900 tracking-tight">{header}</div>
            ) : (
              <div className="text-lg font-bold text-slate-900 tracking-tight">NeedPOS Clone</div>
            )}
          </div>

          {/* Right info */}
          <div className="flex items-center gap-4">
            {outlet && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Store size={12} />
                {outlet.name}
              </span>
            )}
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div className="relative">
              <Dropdown>
                <Dropdown.Trigger>
                  <button className="flex items-center gap-3 text-left focus:outline-none cursor-pointer group">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors duration-200">{user.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium capitalize">
                        {user.roles && user.roles.length > 0 ? user.roles[0].name : 'user'}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 flex items-center justify-center shadow-inner group-hover:bg-indigo-100 transition-all duration-200">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>
                </Dropdown.Trigger>
                <Dropdown.Content align="right" width="48">
                  <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">
                      {user.roles && user.roles.length > 0 ? user.roles[0].name : 'user'}
                    </p>
                  </div>
                  <Dropdown.Link href={route('profile.edit')}>
                    Setting Profile
                  </Dropdown.Link>
                  <Dropdown.Link href={route('logout')} method="post" as="button" className="text-rose-600 hover:text-rose-700">
                    Keluar
                  </Dropdown.Link>
                </Dropdown.Content>
              </Dropdown>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
