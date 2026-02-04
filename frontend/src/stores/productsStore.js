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
  isSaving: false,
  error: null,
  success: null,

  setQuery: (patch) => set(patch),

  clearMessages: () => set({ error: null, success: null }),

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

  // ---------------------------
  // Admin CRUD (multipart/form-data)
  // ---------------------------

  createProduct: async ({
    name,
    description,
    price,
    stock,
    category,
    compatibility,
    imagesFiles,
  }) => {
    set({ isSaving: true, error: null, success: null });
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('description', description);
      fd.append('price', String(price));
      fd.append('stock', String(stock));
      fd.append('category', category);

      const compArr = Array.isArray(compatibility)
        ? compatibility
        : String(compatibility || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

      fd.append('compatibility', JSON.stringify(compArr));

      (imagesFiles || []).forEach((f) => fd.append('images', f));

      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Create product failed');

      set({ isSaving: false, success: 'Product created successfully.' });
      return data.product;
    } catch (e) {
      set({ isSaving: false, error: e.message || 'Create product failed' });
      throw e;
    }
  },

  updateProduct: async (
    id,
    {
      name,
      description,
      price,
      stock,
      category,
      isActive,
      compatibility,
      imagesFiles,
      imagesToRemove,
    },
  ) => {
    set({ isSaving: true, error: null, success: null });
    try {
      const fd = new FormData();

      if (typeof name !== 'undefined') fd.append('name', name);
      if (typeof description !== 'undefined')
        fd.append('description', description);
      if (typeof price !== 'undefined') fd.append('price', String(price));
      if (typeof stock !== 'undefined') fd.append('stock', String(stock));
      if (typeof category !== 'undefined') fd.append('category', category);
      if (typeof isActive !== 'undefined')
        fd.append('isActive', String(isActive));

      if (typeof compatibility !== 'undefined') {
        const compArr = Array.isArray(compatibility)
          ? compatibility
          : String(compatibility || '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
        fd.append('compatibility', JSON.stringify(compArr));
      }

      if (Array.isArray(imagesToRemove) && imagesToRemove.length > 0) {
        fd.append('imagesToRemove', JSON.stringify(imagesToRemove));
      }

      (imagesFiles || []).forEach((f) => fd.append('images', f));

      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Update product failed');

      set({ isSaving: false, success: 'Product updated successfully.' });
      return data.product;
    } catch (e) {
      set({ isSaving: false, error: e.message || 'Update product failed' });
      throw e;
    }
  },

  deleteProduct: async (id) => {
    set({ isSaving: true, error: null, success: null });
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Delete product failed');

      set({ isSaving: false, success: 'Product deactivated successfully.' });
      return true;
    } catch (e) {
      set({ isSaving: false, error: e.message || 'Delete product failed' });
      throw e;
    }
  },
}));