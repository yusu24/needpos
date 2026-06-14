import React from 'react';
import { useCartStore } from '@/stores/useCartStore';
import { formatCurrency } from '@/lib/formatters';
import { Search, Clock } from 'lucide-react';
import { usePage } from '@inertiajs/react';

export default function ProductGrid({ products, categories }) {
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);

  const { auth } = usePage().props;
  const user = auth.user;

  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState(null);
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Filter products based on category and search
  const filteredProducts = products.filter((p) => {
    const matchCategory = activeCategory === null ? true : p.category_id === activeCategory;
    const matchSearch = debouncedSearch.trim() === '' ? true :
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (p.barcode && p.barcode.includes(debouncedSearch)) ||
      (p.sku && p.sku.toLowerCase().includes(debouncedSearch.toLowerCase()));
    return matchCategory && matchSearch;
  });

  // Helper to get cart quantity of product
  const getCartQty = (productId) => {
    const item = cartItems.find((item) => item.product_id === productId);
    return item ? item.quantity : 0;
  };

  const getCatBg = (catName) => {
    const bgMap = { 
      'Makanan': '#FEF3C7', 
      'Minuman': '#DBEAFE', 
      'Snack': '#FCE7F3' 
    };
    return bgMap[catName] || '#F3F4F6';
  };

  return (
    <div className="main-area">
      {/* Top Bar with search, clock, and cashier avatar */}
      <div className="top-bar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Cari produk"
          />
        </div>

        {/* Real-time Clock */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shrink-0 select-none">
          <Clock size={13} className="text-indigo-600" />
          <span>
            {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        <div className="cashier-info select-none">
          <div className="avatar">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <span>{user.name.split(' ')[0]}</span>
        </div>
      </div>

      {/* Category horizontal scroll tabs */}
      <div className="cat-tabs select-none" role="tablist">
        <button
          onClick={() => setActiveCategory(null)}
          className={`cat-tab ${activeCategory === null ? 'active' : ''}`}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="products-grid select-none">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p) => {
            const inCartQty = getCartQty(p.id);
            const maxStock = p.stock?.quantity ?? 0;
            const minStock = p.stock?.min_quantity ?? 5;
            const isOutOfStock = p.track_stock && maxStock <= 0;
            const limitReached = p.track_stock && inCartQty >= maxStock;

            return (
              <div
                key={p.id}
                onClick={() => {
                  if (!isOutOfStock && !limitReached) addItem(p);
                }}
                className={`prod-card ${isOutOfStock || limitReached ? 'out' : ''}`}
                role="listitem"
                tabIndex={!isOutOfStock && !limitReached ? 0 : -1}
                aria-label={`${p.name} ${formatCurrency(p.price)}`}
              >
                <div 
                  className="prod-icon"
                  style={{ backgroundColor: getCatBg(p.category?.name) }}
                >
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="font-extrabold text-slate-700 text-sm">{p.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="prod-name" title={p.name}>{p.name}</div>
                <div className="prod-price">{formatCurrency(p.price)}</div>
                <div className="prod-stock">
                  {p.track_stock ? (maxStock > 0 ? `Stok: ${Math.round(maxStock)}` : 'Habis') : 'Stok: \u221E'}
                </div>

                {isOutOfStock && <span className="badge-out">Habis</span>}

                {inCartQty > 0 && (
                  <span className="absolute top-2 right-2 bg-indigo-600 text-white font-bold text-[9px] w-5 h-5 rounded-full flex items-center justify-center border border-white">
                    {inCartQty}
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '40px 0' }}>
            Produk tidak ditemukan
          </div>
        )}
      </div>
    </div>
  );
}

