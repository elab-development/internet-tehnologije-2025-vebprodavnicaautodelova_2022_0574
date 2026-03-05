import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrdersStore } from '../stores/ordersStore';
import { useAuthStore } from '../stores/authStore';
import { useCurrencyStore } from '../stores/currencyStore';
import { convertFromUSD, formatCurrency } from '../lib/currency';

export default function OrderDetails() {
  const { orderId } = useParams();
  const user = useAuthStore((s) => s.user);

  const order = useOrdersStore((s) => s.selectedOrder);
  const isLoading = useOrdersStore((s) => s.isLoading);
  const error = useOrdersStore((s) => s.error);
  const fetchOrderById = useOrdersStore((s) => s.fetchOrderById);
  const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatus);

  const currency = useCurrencyStore((s) => s.currency);
  const rates = useCurrencyStore((s) => s.rates);
  const rate = rates[currency] || 1;

  useEffect(() => {
    fetchOrderById(orderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function handleCancel() {
    try {
      await updateOrderStatus(orderId, 'cancelled');
      await fetchOrderById(orderId);
    } catch {}
  }

  if (!user) {
    return (
      <div className='rounded-2xl border border-neutral-800 bg-neutral-900 p-6'>
        <p className='text-neutral-300'>Please login to view orders.</p>
        <Link
          to='/login'
          className='mt-4 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500'
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-300'>
        Loading order...
      </div>
    );
  }

  if (error) {
    return (
      <div className='rounded-2xl border border-red-700/40 bg-red-950/40 p-6 text-red-200'>
        {error}
      </div>
    );
  }

  if (!order) return null;

  const canCancel = user.role !== 'admin' && order.status === 'pending';

  return (
    <div className='grid gap-6'>
      <Link to='/' className='text-sm text-neutral-300 hover:text-white'>
        ← Back
      </Link>

      <div className='rounded-2xl border border-neutral-800 bg-neutral-900 p-4'>
        <div className='flex flex-col justify-between gap-3 md:flex-row md:items-center'>
          <div>
            <h1 className='text-2xl font-bold text-white'>
              Order <span className='text-red-500'>#{order.id}</span>
            </h1>
            <p className='mt-1 text-sm text-neutral-400'>
              Status:{' '}
              <span className='font-semibold text-neutral-100'>
                {order.status}
              </span>
            </p>
          </div>

          {canCancel ? (
            <button
              onClick={handleCancel}
              className='rounded-lg border border-red-700/40 bg-red-950/40 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-900/40'
            >
              Cancel order
            </button>
          ) : null}
        </div>

        <div className='mt-4 grid gap-2 text-sm text-neutral-300'>
          <div>
            <span className='text-neutral-500'>Address:</span>{' '}
            <span className='text-neutral-100'>{order.address}</span>
          </div>
          <div>
            <span className='text-neutral-500'>Total:</span>{' '}
            <span className='text-neutral-100 font-bold'>
              {formatCurrency(
                convertFromUSD(order.totalAmount, rate),
                currency,
              )}
            </span>
          </div>
          <div>
            <span className='text-neutral-500'>Created:</span>{' '}
            <span className='text-neutral-100'>
              {new Date(order.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        <div className='mt-6'>
          <h2 className='text-lg font-semibold text-white'>Items</h2>

          <div className='mt-3 grid gap-3'>
            {order.items?.map((it) => {
              const img = Array.isArray(it.product?.images)
                ? it.product.images[0]
                : null;
              const imgUrl = img?.url || img?.secureUrl || '';

              return (
                <div
                  key={it.id}
                  className='flex gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3'
                >
                  <div className='h-20 w-28 overflow-hidden rounded-lg bg-neutral-800'>
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={it.product?.name || 'Product'}
                        className='h-full w-full object-cover'
                      />
                    ) : null}
                  </div>

                  <div className='flex flex-1 items-start justify-between gap-3'>
                    <div>
                      <div className='font-semibold text-white'>
                        {it.product?.name || `Product #${it.productId}`}
                      </div>
                      <div className='text-sm text-neutral-400'>
                        Unit price:{' '}
                        {formatCurrency(
                          convertFromUSD(it.price, rate),
                          currency,
                        )}
                      </div>
                      <div className='text-sm text-neutral-400'>
                        Qty:{' '}
                        <span className='text-neutral-100'>{it.quantity}</span>
                      </div>
                    </div>

                    <div className='text-sm text-neutral-300'>
                      Line total:{' '}
                      <span className='font-bold text-white'>
                        {convertFromUSD(
                          Number(it.price) * it.quantity,
                          rate,
                        ).toFixed(2)}{' '}
                        {currency}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
