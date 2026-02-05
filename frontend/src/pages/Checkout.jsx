import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useOrdersStore } from '../stores/ordersStore';

export default function Checkout() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const createOrder = useOrdersStore((s) => s.createOrder);
  const isLoading = useOrdersStore((s) => s.isLoading);
  const error = useOrdersStore((s) => s.error);

  const hasProfileAddress = Boolean(user?.deliveryAddress?.trim());
  const [address, setAddress] = useState('');

  const orderItemsPayload = useMemo(() => {
    return items.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
    }));
  }, [items]);

  if (!user) {
    return (
      <div className='rounded-2xl border border-neutral-800 bg-neutral-900 p-6'>
        <h1 className='text-xl font-bold text-white'>Checkout</h1>
        <p className='mt-2 text-neutral-300'>Please login first.</p>
        <Link
          to='/login'
          className='mt-4 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500'
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className='rounded-2xl border border-neutral-800 bg-neutral-900 p-6'>
        <h1 className='text-xl font-bold text-white'>Checkout</h1>
        <p className='mt-2 text-neutral-300'>Your cart is empty.</p>
        <Link
          to='/products'
          className='mt-4 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500'
        >
          Browse products
        </Link>
      </div>
    );
  }

  async function handlePlaceOrder() {
    const finalAddress = hasProfileAddress
      ? user.deliveryAddress.trim()
      : address.trim();
    if (!finalAddress) return;

    try {
      const order = await createOrder({
        items: orderItemsPayload,
        ...(hasProfileAddress ? {} : { address: finalAddress }),
      });

      clearCart();
      navigate(`/orders/${order.id}`);
    } catch {}
  }

  const canSubmit = hasProfileAddress ? true : address.trim().length >= 3;

  return (
    <div className='grid gap-6 md:grid-cols-3'>
      <div className='md:col-span-2 rounded-2xl border border-neutral-800 bg-neutral-900 p-4'>
        <h1 className='text-2xl font-bold text-white'>Checkout</h1>
        <p className='mt-1 text-sm text-neutral-400'>
          Confirm address and place your order.
        </p>

        <div className='mt-5 grid gap-2'>
          <label className='text-sm text-neutral-300'>Delivery address</label>

          {hasProfileAddress ? (
            <div className='rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-neutral-200'>
              {user.deliveryAddress}
              <div className='mt-2 text-xs text-neutral-500'>
                Address is managed in Profile.
              </div>
            </div>
          ) : (
            <input
              className='rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-red-500'
              placeholder='Enter delivery address...'
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          )}
        </div>

        {error ? (
          <div className='mt-4 rounded-xl border border-red-700/40 bg-red-950/40 p-3 text-sm text-red-200'>
            {error}
          </div>
        ) : null}

        <div className='mt-6 flex items-center justify-between'>
          <Link
            to='/cart'
            className='text-sm text-neutral-300 hover:text-white'
          >
            Back to cart
          </Link>

          <button
            disabled={!canSubmit || isLoading}
            onClick={handlePlaceOrder}
            className='rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isLoading ? 'Placing...' : 'Place order'}
          </button>
        </div>
      </div>

      <div className='rounded-2xl border border-neutral-800 bg-neutral-900 p-4'>
        <h2 className='text-lg font-semibold text-white'>Summary</h2>

        <div className='mt-4 space-y-3'>
          {items.map((it) => (
            <div key={it.productId} className='flex justify-between text-sm'>
              <span className='text-neutral-300'>
                {it.name} ×{' '}
                <span className='text-neutral-100'>{it.quantity}</span>
              </span>
              <span className='text-neutral-200'>
                ${(it.price * it.quantity).toFixed(2)}
              </span>
            </div>
          ))}

          <div className='h-px bg-neutral-800' />
          <div className='flex justify-between text-neutral-200'>
            <span>Total</span>
            <span className='text-lg font-bold text-white'>
              ${subtotal.toFixed(2)}
            </span>
          </div>

          <div className='text-xs text-neutral-500'>
            Payment is not implemented yet. Order will be created with status{' '}
            <span className='text-neutral-200'>pending</span>.
          </div>
        </div>
      </div>
    </div>
  );
}