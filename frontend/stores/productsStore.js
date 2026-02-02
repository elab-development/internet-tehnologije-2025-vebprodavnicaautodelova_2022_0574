import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function qs(params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v)) v.forEach((x) => sp.append(k, x));
    else sp.set(k, String(v));
  });
  return sp.toString();
}

export const useProductsStore = create((set, get) => ({
  products: [],
  total: 0,
  totalPages: 0,
  page: 1,
  limit: 12,

  q: '',
  category: '',
  compatibility: [],
  sortBy: 'createdAt',
  sortDir: 'desc',

  selectedProduct: null,

  isLoading: false,
  error: null,

  setQuery: (patch) => set(patch),

  resetFilters: () =>
    set({
      q: '',
      category: '',
      compatibility: [],
      sortBy: 'createdAt',
      sortDir: 'desc',
      page: 1,
    }),

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const st = get();
      const query = qs({
        page: st.page,
        limit: st.limit,
        sortBy: st.sortBy,
        sortDir: st.sortDir,
        category: st.category,
        q: st.q,
        compatibility: st.compatibility,
      });

      const res = await fetch(`${API_URL}/api/products?${query}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load products');

      set({
        products: data.products || [],
        total: data.total || 0,
        totalPages: data.totalPages || 0,
        isLoading: false,
      });
    } catch (e) {
      set({ isLoading: false, error: e.message || 'Failed to load products' });
    }
  },

  fetchProductById: async (id) => {
    set({ isLoading: true, error: null, selectedProduct: null });
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load product');

      set({ selectedProduct: data.product, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: e.message || 'Failed to load product' });
    }
  },
}));