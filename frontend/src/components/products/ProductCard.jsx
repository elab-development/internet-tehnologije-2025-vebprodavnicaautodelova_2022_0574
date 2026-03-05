import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useCurrencyStore } from '../../stores/currencyStore';
import { convertFromUSD, formatCurrency } from '../../lib/currency';

export default function ProductCard({ product }) {
  const user = useAuthStore((s) => s.user);
  const addToCart = useCartStore((s) => s.addToCart);

  const firstImg = Array.isArray(product.images) ? product.images[0] : null;
  const imgUrl = firstImg?.url || firstImg?.secureUrl || '';

  const currency = useCurrencyStore((s) => s.currency);
  const rates = useCurrencyStore((s) => s.rates);

  const rate = rates[currency] || 1;
  const converted = convertFromUSD(product.price, rate);

  return (
    <div className='overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900'>
      <Link to={`/products/${product.id}`} className='block'>
        <div className='aspect-4/3 w-full bg-neutral-800'>
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={product.name}
              className='h-full w-full object-cover'
            />
          ) : null}
        </div>
        <div className='p-4'>
          <div className='flex items-start justify-between gap-3'>
            <h3 className='line-clamp-2 font-semibold text-white'>
              {product.name}
            </h3>
            <span className='shrink-0 rounded-full bg-red-600/15 px-2 py-1 text-xs font-semibold text-red-300'>
              {product.category}
            </span>
          </div>

          <p className='mt-2 line-clamp-2 text-sm text-neutral-400'>
            {product.description}
          </p>

          <div className='mt-3 flex items-center justify-between'>
            <div className='text-lg font-bold text-white'>
              {formatCurrency(converted, currency)}
            </div>
            <div className='text-xs text-neutral-400'>
              Stock: <span className='text-neutral-200'>{product.stock}</span>
            </div>
          </div>
        </div>
      </Link>

      <div className='border-t border-neutral-800 p-3'>
        <button
          disabled={!user}
          onClick={() => addToCart(product, 1)}
          className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60'
          title={user ? 'Add to cart' : 'Login to add to cart'}
        >
          <FiPlus className='h-4 w-4' />
          Add to cart
        </button>
      </div>
    </div>
  );
}
