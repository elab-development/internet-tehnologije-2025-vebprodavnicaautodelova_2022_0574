import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../test/utils';

vi.mock('../../stores/authStore', () => ({
  useAuthStore: (sel) => sel({ user: { id: 7, role: 'customer' } }),
}));

vi.mock('../../stores/currencyStore', () => ({
  useCurrencyStore: (sel) =>
    sel({
      currency: 'USD',
      rates: { USD: 1 },
    }),
}));

const setQuantity = vi.fn();
const removeFromCart = vi.fn();

vi.mock('../../stores/cartStore', () => ({
  useCartStore: (sel) =>
    sel({
      items: [
        { productId: 1, name: 'Oil', price: 10, imageUrl: '', quantity: 2 },
      ],
      subtotal: 20,
      setQuantity,
      removeFromCart,
    }),
}));

import Cart from '../Cart';

describe('Cart page (items)', () => {
  it('renders item and calls setQuantity on input change', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Cart />, { route: '/cart' });

    expect(screen.getByText('Oil')).toBeInTheDocument();
    const qtyInput = screen.getByDisplayValue('2');
    await user.clear(qtyInput);
    await user.type(qtyInput, '5');

    expect(setQuantity).toHaveBeenCalled();
    // last call: (productId, quantity)
    const last = setQuantity.mock.calls.at(-1);
    expect(last[0]).toBe(1);
  });

  it('calls removeFromCart when Remove clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Cart />, { route: '/cart' });

    await user.click(screen.getByRole('button', { name: /remove/i }));
    expect(removeFromCart).toHaveBeenCalledWith(1);
  });
});
