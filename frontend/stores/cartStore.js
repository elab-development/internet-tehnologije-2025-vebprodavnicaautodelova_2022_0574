import { create } from 'zustand';
import { useAuthStore } from './authStore';

function keyForUser(userId) {
  return `pitstop_cart_${userId}`;
}

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function computeTotals(items) {
  const itemsCount = items.reduce((sum, it) => sum + it.quantity, 0);
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  return { itemsCount, subtotal };
}

export const useCartStore = create((set, get) => ({
  items: [], // { productId, name, price, imageUrl, quantity }
  itemsCount: 0,
  subtotal: 0,

  hydrateFromStorage: () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ items: [], ...computeTotals([]) });
      return;
    }
    const raw = localStorage.getItem(keyForUser(user.id));
    const items = raw ? safeParse(raw, []) : [];
    set({ items, ...computeTotals(items) });
  },

  persistToStorage: () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    localStorage.setItem(keyForUser(user.id), JSON.stringify(get().items));
  },

  clearCart: () => {
    const user = useAuthStore.getState().user;
    if (user) localStorage.removeItem(keyForUser(user.id));
    set({ items: [], ...computeTotals([]) });
  },

  addToCart: (product, qty = 1) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('You must be logged in to add to cart.');

    const productId = Number(product.id);
    const quantity = Number(qty);

    if (!Number.isInteger(productId) || productId <= 0)
      throw new Error('Invalid product');
    if (!Number.isInteger(quantity) || quantity <= 0)
      throw new Error('Invalid quantity');

    const current = get().items.slice();

    const firstImg = Array.isArray(product.images) ? product.images[0] : null;
    const imageUrl = firstImg?.url || firstImg?.secureUrl || '';

    const idx = current.findIndex((x) => x.productId === productId);

    if (idx >= 0) {
      current[idx] = {
        ...current[idx],
        quantity: current[idx].quantity + quantity,
      };
    } else {
      current.push({
        productId,
        name: product.name,
        price: Number(product.price),
        imageUrl,
        quantity,
      });
    }

    const totals = computeTotals(current);
    set({ items: current, ...totals });
    get().persistToStorage();
  },

  removeFromCart: (productId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const pid = Number(productId);
    const next = get().items.filter((x) => x.productId !== pid);
    set({ items: next, ...computeTotals(next) });
    get().persistToStorage();
  },

  setQuantity: (productId, quantity) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const pid = Number(productId);
    const q = Number(quantity);

    if (!Number.isInteger(q) || q < 1) return;

    const next = get().items.map((x) =>
      x.productId === pid ? { ...x, quantity: q } : x,
    );
    set({ items: next, ...computeTotals(next) });
    get().persistToStorage();
  },
}));