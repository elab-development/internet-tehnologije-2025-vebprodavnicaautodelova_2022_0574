import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import Navbar from '../components/Navbar';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const hydrateCart = useCartStore((s) => s.hydrateFromStorage);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    if (user) hydrateCart();
    else clearCart();
  }, [user, hydrateCart, clearCart]);

  return (
    <div className='min-h-screen bg-neutral-950 text-neutral-100'>
      <Navbar />
      <main className='mx-auto w-full max-w-6xl px-4 py-8'>
        <Outlet />
      </main>
    </div>
  );
}
