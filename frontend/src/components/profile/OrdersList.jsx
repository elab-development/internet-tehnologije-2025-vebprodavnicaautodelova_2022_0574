import { Link } from 'react-router-dom';
import { useCurrencyStore } from '../../stores/currencyStore';
import { convertFromUSD, formatCurrency } from '../../lib/currency';

const badge = (status) => {
  const base =
    'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold';
  switch (status) {
    case 'pending':
      return `${base} border-yellow-500/30 bg-yellow-950/30 text-yellow-200`;
    case 'processing':
      return `${base} border-blue-500/30 bg-blue-950/30 text-blue-200`;
    case 'shipped':
      return `${base} border-purple-500/30 bg-purple-950/30 text-purple-200`;
    case 'delivered':
      return `${base} border-green-500/30 bg-green-950/30 text-green-200`;
    case 'cancelled':
      return `${base} border-red-500/30 bg-red-950/30 text-red-200`;
    default:
      return `${base} border-neutral-700 bg-neutral-900 text-neutral-200`;
  }
};

export default function OrdersList({
  orders,
  page,
  totalPages,
  onPrev,
  onNext,
}) {
  const currency = useCurrencyStore((s) => s.currency);
  const rates = useCurrencyStore((s) => s.rates);
  const rate = rates[currency] || 1;

  if (!orders?.length) {
    return (
      <div className='rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300'>
        No orders yet.
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <div className='grid gap-3'>
        {orders.map((o) => (
          <div
            key={o.id}
            className='flex flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-950 p-4 md:flex-row md:items-center md:justify-between'
          >
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold text-white'>
                  Order #{o.id}
                </span>
                <span className={badge(o.status)}>{o.status}</span>
              </div>
              <div className='text-xs text-neutral-400'>
                {new Date(o.createdAt).toLocaleString()}
              </div>
              <div className='text-sm text-neutral-300'>
                Total:{' '}
                <span className='font-bold text-white'>
                  {formatCurrency(
                    convertFromUSD(o.totalAmount, rate),
                    currency,
                  )}
                </span>
              </div>
            </div>

            <div className='flex items-center justify-end gap-2'>
              <Link
                to={`/orders/${o.id}`}
                className='rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800'
              >
                Open
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className='flex items-center justify-between'>
        <button
          disabled={page <= 1}
          onClick={onPrev}
          className='rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 disabled:opacity-60'
        >
          Prev
        </button>

        <div className='text-sm text-neutral-400'>
          Page <span className='text-neutral-200'>{page}</span> /{' '}
          <span className='text-neutral-200'>{totalPages || 1}</span>
        </div>

        <button
          disabled={totalPages ? page >= totalPages : true}
          onClick={onNext}
          className='rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 disabled:opacity-60'
        >
          Next
        </button>
      </div>
    </div>
  );
}
