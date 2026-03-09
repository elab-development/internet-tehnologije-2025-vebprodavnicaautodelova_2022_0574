import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock authStore pre importa cartStore
vi.mock('../authStore', () => {
  let user = { id: 7, role: 'customer', fullName: 'Test User' };

  return {
    useAuthStore: {
      getState: () => ({ user }),
      // helper da menjamo user u testu
      __setUser: (u) => {
        user = u;
      },
    },
  };
});

import { useAuthStore } from '../authStore';
import { useCartStore } from '../cartStore';

function resetCart() {
  useCartStore.setState({ items: [], itemsCount: 0, subtotal: 0 });
}

describe('cartStore', () => {
  beforeEach(() => {
    localStorage.clear();
    resetCart();
    useAuthStore.__setUser({ id: 7, role: 'customer', fullName: 'Test User' });
  });

  it('addToCart adds new item and updates totals + persists', () => {
    const product = {
      id: 10,
      name: 'Brake Pads',
      price: 25.5,
      images: [{ url: 'http://img' }],
    };

    useCartStore.getState().addToCart(product, 2);

    const st = useCartStore.getState();
    expect(st.items).toHaveLength(1);
    expect(st.items[0]).toMatchObject({
      productId: 10,
      name: 'Brake Pads',
      price: 25.5,
      quantity: 2,
      imageUrl: 'http://img',
    });

    expect(st.itemsCount).toBe(2);
    expect(st.subtotal).toBe(51);

    const raw = localStorage.getItem('pitstop_cart_7');
    expect(raw).toBeTruthy();
  });

  it('addToCart increments quantity if product already exists', () => {
    const product = { id: 10, name: 'Brake Pads', price: 10, images: [] };

    useCartStore.getState().addToCart(product, 1);
    useCartStore.getState().addToCart(product, 3);

    const st = useCartStore.getState();
    expect(st.items).toHaveLength(1);
    expect(st.items[0].quantity).toBe(4);
    expect(st.itemsCount).toBe(4);
    expect(st.subtotal).toBe(40);
  });

  it('removeFromCart removes item and updates totals', () => {
    const product = { id: 1, name: 'Oil', price: 5, images: [] };

    useCartStore.getState().addToCart(product, 2);
    useCartStore.getState().removeFromCart(1);

    const st = useCartStore.getState();
    expect(st.items).toHaveLength(0);
    expect(st.itemsCount).toBe(0);
    expect(st.subtotal).toBe(0);
  });

  it('setQuantity updates quantity when >= 1', () => {
    const product = { id: 1, name: 'Oil', price: 5, images: [] };

    useCartStore.getState().addToCart(product, 1);
    useCartStore.getState().setQuantity(1, 4);

    const st = useCartStore.getState();
    expect(st.items[0].quantity).toBe(4);
    expect(st.itemsCount).toBe(4);
    expect(st.subtotal).toBe(20);
  });

  it('setQuantity ignores invalid quantity (<1)', () => {
    const product = { id: 1, name: 'Oil', price: 5, images: [] };

    useCartStore.getState().addToCart(product, 2);
    useCartStore.getState().setQuantity(1, 0);

    const st = useCartStore.getState();
    expect(st.items[0].quantity).toBe(2);
  });

  it('hydrateFromStorage loads items for logged user', () => {
    const payload = [
      { productId: 2, name: 'Filter', price: 10, imageUrl: '', quantity: 3 },
    ];
    localStorage.setItem('pitstop_cart_7', JSON.stringify(payload));

    useCartStore.getState().hydrateFromStorage();

    const st = useCartStore.getState();
    expect(st.items).toHaveLength(1);
    expect(st.itemsCount).toBe(3);
    expect(st.subtotal).toBe(30);
  });

  it('clearCart resets state and removes key', () => {
    const product = { id: 1, name: 'Oil', price: 5, images: [] };
    useCartStore.getState().addToCart(product, 1);

    useCartStore.getState().clearCart();

    const st = useCartStore.getState();
    expect(st.items).toHaveLength(0);
    expect(localStorage.getItem('pitstop_cart_7')).toBeNull();
  });

  it('addToCart throws if user not logged in', () => {
    useAuthStore.__setUser(null);
    const product = { id: 1, name: 'Oil', price: 5, images: [] };

    expect(() => useCartStore.getState().addToCart(product, 1)).toThrow(
      /logged in/i,
    );
  });
});
