import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2 } from 'react-icons/fi';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';

export default function Cart() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);

  if (!user) {
    return (
      <div className='rounded-2xl border border-neutral-800 bg-neutral-900 p-6'>
        <h1 className='text-xl font-bold text-white'>Cart</h1>
        <p className='mt-2 text-neutral-300'>Please login to view your cart.</p>
        <Link
          to='/login'
          className='mt-4 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500'
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className='grid gap-6 md:grid-cols-3'>
      <div className='md:col-span-2'>
        <div className='rounded-2xl border border-neutral-800 bg-neutral-900 p-4'>
          <h1 className='text-2xl font-bold text-white'>Your Cart</h1>
          <p className='mt-1 text-sm text-neutral-400'>
            Review items before checkout.
          </p>

          {items.length === 0 ? (
            <div className='mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-neutral-300'>
              Cart is empty.{' '}
              <Link to='/products' className='text-red-400 hover:text-red-300'>
                Browse products
              </Link>
              .
            </div>
          ) : (
            <div className='mt-4 grid gap-3'>
              {items.map((it) => (
                <div
                  key={it.productId}
                  className='flex gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3'
                >
                  <div className='h-20 w-28 overflow-hidden rounded-lg bg-neutral-800'>
                    {it.imageUrl ? (
                      <img
                        src={it.imageUrl}
                        alt={it.name}
                        className='h-full w-full object-cover'
                      />
                    ) : null}
                  </div>

                  <div className='flex flex-1 flex-col'>
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <div className='font-semibold text-white'>
                          {it.name}
                        </div>
                        <div className='text-sm text-neutral-400'>
                          ${Number(it.price).toFixed(2)} each
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(it.productId)}
                        className='inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800'
                        title='Remove'
                      >
                        <FiTrash2 className='h-4 w-4 text-red-400' />
                        Remove
                      </button>
                    </div>

                    <div className='mt-3 flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm text-neutral-400'>Qty</span>
                        <input
                          type='number'
                          min={1}
                          className='w-24 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-red-500'
                          value={it.quantity}
                          onChange={(e) =>
                            setQuantity(it.productId, Number(e.target.value))
                          }
                        />
                      </div>

                      <div className='text-sm text-neutral-300'>
                        Line total:{' '}
                        <span className='font-bold text-white'>
                          ${(it.price * it.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 ? (
            <div className='mt-4 flex justify-end'>
              <button
                onClick={() => navigate('/checkout')}
                className='rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500'
              >
                Continue to Checkout
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className='rounded-2xl border border-neutral-800 bg-neutral-900 p-4'>
        <h2 className='text-lg font-semibold text-white'>Summary</h2>
        <div className='mt-4 space-y-2 text-sm'>
          <div className='flex justify-between text-neutral-300'>
            <span>Subtotal</span>
            <span className='font-semibold text-white'>
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className='flex justify-between text-neutral-500'>
            <span>Shipping</span>
            <span>—</span>
          </div>
          <div className='h-px bg-neutral-800' />
          <div className='flex justify-between text-neutral-200'>
            <span>Total</span>
            <span className='text-lg font-bold text-white'>
              ${subtotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}