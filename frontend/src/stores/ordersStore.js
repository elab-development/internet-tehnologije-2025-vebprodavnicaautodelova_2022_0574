import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function qs(params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    sp.set(k, String(v));
  });
  return sp.toString();
}

export const useOrdersStore = create((set, get) => ({
  orders: [],
  total: 0,
  totalPages: 0,
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortDir: 'desc',
  status: '',

  selectedOrder: null,

  isLoading: false,
  error: null,

  setQuery: (patch) => set(patch),

  resetQuery: () =>
    set({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortDir: 'desc',
      status: '',
    }),

  createOrder: async ({ items, address }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items, ...(address ? { address } : {}) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to create order');

      set({ isLoading: false });
      return data.order;
    } catch (e) {
      set({ isLoading: false, error: e.message || 'Failed to create order' });
      throw e;
    }
  },

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const st = get();
      const query = qs({
        page: st.page,
        limit: st.limit,
        sortBy: st.sortBy,
        sortDir: st.sortDir,
        status: st.status,
      });

      const res = await fetch(`${API_URL}/api/orders?${query}`, {
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load orders');

      set({
        orders: data.orders || [],
        total: data.total || 0,
        totalPages: data.totalPages || 0,
        isLoading: false,
      });
    } catch (e) {
      set({ isLoading: false, error: e.message || 'Failed to load orders' });
    }
  },

  fetchOrderById: async (id) => {
    set({ isLoading: true, error: null, selectedOrder: null });
    try {
      const res = await fetch(`${API_URL}/api/orders/${id}`, {
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load order');

      set({ selectedOrder: data.order, isLoading: false });
      return data.order;
    } catch (e) {
      set({ isLoading: false, error: e.message || 'Failed to load order' });
      throw e;
    }
  },

  updateOrderStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to update status');

      if (get().selectedOrder?.id === Number(id)) {
        set({ selectedOrder: data.order });
      }

      set({ isLoading: false });
      return data.order;
    } catch (e) {
      set({ isLoading: false, error: e.message || 'Failed to update status' });
      throw e;
    }
  },
}));