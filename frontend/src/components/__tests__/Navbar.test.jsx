import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../test/utils';

vi.mock('../../stores/authStore', () => ({
  useAuthStore: (sel) =>
    sel({
      user: { id: 7, role: 'customer', fullName: 'Test User' },
      logout: vi.fn(),
    }),
}));

vi.mock('../../stores/currencyStore', () => ({
  useCurrencyStore: (sel) =>
    sel({
      currency: 'USD',
      setCurrency: vi.fn(),
      rates: { USD: 1, EUR: 0.9 },
      isLoading: false,
    }),
}));

import { useCartStore } from '../../stores/cartStore';
import Navbar from '../Navbar';

describe('Navbar cart badge', () => {
  beforeEach(() => {
    useCartStore.setState({ itemsCount: 0 });
  });

  it('shows badge with count when cartCount > 0', () => {
    useCartStore.setState({ itemsCount: 3 });

    renderWithRouter(<Navbar />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not show badge when cartCount = 0', () => {
    useCartStore.setState({ itemsCount: 0 });

    renderWithRouter(<Navbar />);

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
