import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useUsersStore = create((set) => ({
  isLoading: false,
  error: null,
  success: null,

  clearMessages: () => set({ error: null, success: null }),

  updateMyProfile: async ({ fullName, deliveryAddress }) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const body = {};
      if (typeof fullName !== 'undefined') body.fullName = fullName;
      if (typeof deliveryAddress !== 'undefined')
        body.deliveryAddress = deliveryAddress;

      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Profile update failed');

      useAuthStore.getState().setUser(data.user);

      set({ isLoading: false, success: 'Profile updated successfully.' });
      return data.user;
    } catch (e) {
      set({
        isLoading: false,
        error: e.message || 'Profile update failed',
      });
      throw e;
    }
  },
}));