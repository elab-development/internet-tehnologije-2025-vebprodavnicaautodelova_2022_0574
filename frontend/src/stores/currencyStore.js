import { create } from 'zustand';
import { fetchRates } from '../lib/currency';

export const useCurrencyStore = create((set) => ({
  currency: 'USD',
  rates: { USD: 1 }, 
  isLoading: false,
  error: null,

  setCurrency: (currency) => set({ currency }),

  loadRates: async () => {
    set({ isLoading: true, error: null });
    try {
      const rates = await fetchRates();
      set({ rates: { USD: 1, ...(rates || {}) }, isLoading: false }); // ✅ safe
    } catch (e) {
      set({ isLoading: false, error: e?.message || 'Failed to load rates' });
    }
  },
}));