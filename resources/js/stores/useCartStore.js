import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  discount: null,
  note: '',
  paymentMethod: 'cash',
  paymentAmount: 0,

  // Actions
  addItem: (product) => {
    const items = get().items;
    const existingIndex = items.findIndex((item) => item.product_id === product.id);
    const maxStock = product.stock?.quantity ?? 0;

    if (existingIndex > -1) {
      const updatedItems = [...items];
      const newQty = updatedItems[existingIndex].quantity + 1;

      if (product.track_stock && newQty > maxStock) {
        // Jangan tambahkan jika melebihi stok
        return;
      }

      updatedItems[existingIndex].quantity = newQty;
      set({ items: updatedItems });
    } else {
      if (product.track_stock && maxStock <= 0) {
        // Jangan tambahkan jika tidak ada stok
        return;
      }
      set({
        items: [
          ...items,
          {
            product_id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            quantity: 1,
            unit: product.unit || 'pcs',
            track_stock: product.track_stock,
            max_stock: maxStock,
          },
        ],
      });
    }
  },

  removeItem: (productId) => {
    set({
      items: get().items.filter((item) => item.product_id !== productId),
    });
  },

  updateQty: (productId, qty) => {
    const items = get().items;
    const index = items.findIndex((item) => item.product_id === productId);
    if (index === -1) return;

    const parsedQty = parseFloat(qty);
    if (isNaN(parsedQty) || parsedQty <= 0) return;

    const item = items[index];
    if (item.track_stock && parsedQty > item.max_stock) {
      // Limit to max stock
      const updatedItems = [...items];
      updatedItems[index].quantity = item.max_stock;
      set({ items: updatedItems });
      return;
    }

    const updatedItems = [...items];
    updatedItems[index].quantity = parsedQty;
    set({ items: updatedItems });
  },

  applyDiscount: (discount) => {
    set({ discount });
  },

  setNote: (note) => {
    set({ note });
  },

  setPaymentMethod: (paymentMethod) => {
    set({ paymentMethod });
  },

  setPaymentAmount: (paymentAmount) => {
    set({ paymentAmount: parseFloat(paymentAmount) || 0 });
  },

  clearCart: () => {
    set({
      items: [],
      discount: null,
      note: '',
      paymentMethod: 'cash',
      paymentAmount: 0,
    });
  },

  // Computed values getters
  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getDiscountAmount: () => {
    const discount = get().discount;
    const subtotal = get().getSubtotal();
    if (!discount || subtotal < parseFloat(discount.min_purchase)) {
      return 0;
    }

    if (discount.type === 'percentage') {
      return (subtotal * parseFloat(discount.value)) / 100;
    } else if (discount.type === 'flat') {
      return parseFloat(discount.value);
    }
    return 0;
  },

  getTaxAmount: (taxRate = 11) => {
    const subtotal = get().getSubtotal();
    const discountAmount = get().getDiscountAmount();
    const taxable = Math.max(0, subtotal - discountAmount);
    return Math.round(taxable * (taxRate / 100) * 100) / 100;
  },

  getTotal: (taxRate = 11) => {
    const subtotal = get().getSubtotal();
    const discountAmount = get().getDiscountAmount();
    const taxAmount = get().getTaxAmount(taxRate);
    return Math.max(0, subtotal - discountAmount + taxAmount);
  },
}));
