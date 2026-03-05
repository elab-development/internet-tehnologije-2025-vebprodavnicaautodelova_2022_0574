import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useAdminStatsStore = create((set) => ({
  kpis: null,
  charts: null,

  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchAdminStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/admin/stats`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.message || 'Failed to load admin stats');

      set({
        kpis: data?.kpis || null,
        charts: data?.charts || null,
        isLoading: false,
      });
    } catch (e) {
      set({
        isLoading: false,
        error: e?.message || 'Failed to load admin stats',
      });
    }
  },
}));
