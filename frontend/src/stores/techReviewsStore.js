import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const parseJson = async (res) => {
  const data = await res.json().catch(() => ({}));
  return data;
};

export const useTechReviewsStore = create((set, get) => ({
  reviews: [],
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,

  isLoading: false,
  isSubmitting: false,
  error: null,

  clearError: () => set({ error: null }),

  setQuery: (patch) => set((s) => ({ ...s, ...patch })),

  fetchForProduct: async (productId, query = {}) => {
    set({ isLoading: true, error: null });
    try {
      const pid = Number(productId);
      if (!Number.isInteger(pid) || pid <= 0)
        throw new Error('Invalid productId');

      const page = query.page ?? get().page;
      const limit = query.limit ?? get().limit;

      const qs = new URLSearchParams();
      qs.set('page', String(page));
      qs.set('limit', String(limit));

      const res = await fetch(
        `${API_URL}/api/tech-reviews/product/${pid}?${qs.toString()}`,
        { credentials: 'include' },
      );

      const data = await parseJson(res);
      if (!res.ok) throw new Error(data?.message || 'Failed to load reviews');

      set({
        isLoading: false,
        reviews: data.reviews || [],
        page: data.page || page,
        limit: data.limit || limit,
        total: data.total || 0,
        totalPages: data.totalPages || 1,
      });
    } catch (e) {
      set({ isLoading: false, error: e.message || 'Failed to load reviews' });
    }
  },

  createReview: async ({ productId, text, rating }) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/tech-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId, text, rating }),
      });

      const data = await parseJson(res);
      if (!res.ok) throw new Error(data?.message || 'Create review failed');

      set((s) => ({
        isSubmitting: false,
        reviews: [data.review, ...s.reviews],
        total: s.total + 1,
      }));

      return data.review;
    } catch (e) {
      set({ isSubmitting: false, error: e.message || 'Create review failed' });
      throw e;
    }
  },

  updateReview: async (id, { text, rating }) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/tech-reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text, rating }),
      });

      const data = await parseJson(res);
      if (!res.ok) throw new Error(data?.message || 'Update review failed');

      set((s) => ({
        isSubmitting: false,
        reviews: s.reviews.map((r) => (r.id === id ? data.review : r)),
      }));

      return data.review;
    } catch (e) {
      set({ isSubmitting: false, error: e.message || 'Update review failed' });
      throw e;
    }
  },

  deleteReview: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/tech-reviews/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await parseJson(res);
      if (!res.ok) throw new Error(data?.message || 'Delete review failed');

      set((s) => ({
        isSubmitting: false,
        reviews: s.reviews.filter((r) => r.id !== id),
        total: Math.max(0, s.total - 1),
      }));
    } catch (e) {
      set({ isSubmitting: false, error: e.message || 'Delete review failed' });
      throw e;
    }
  },
}));
