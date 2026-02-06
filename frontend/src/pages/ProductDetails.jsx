import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';
import { useProductsStore } from '../stores/productsStore';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import ProductReviews from '../components/products/ProductReviews';

export default function ProductDetails() {
  const { productId } = useParams();
  const { selectedProduct, isLoading, error, fetchProductById } =
    useProductsStore();
  const user = useAuthStore((s) => s.user);
  const addToCart = useCartStore((s) => s.addToCart);

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    fetchProductById(productId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const images = useMemo(() => {
    const arr = Array.isArray(selectedProduct?.images)
      ? selectedProduct.images
      : [];
    return arr.map((x) => x?.url || x?.secureUrl).filter(Boolean);
  }, [selectedProduct]);

  const compatibility = useMemo(() => {
    return Array.isArray(selectedProduct?.compatibility)
      ? selectedProduct.compatibility
      : [];
  }, [selectedProduct]);

  if (isLoading) {
    return (
      <div className='rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-300'>
        Loading product...
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

  if (!selectedProduct) return null;

  return (
    <div className='grid gap-6'>
      <Link
        to='/products'
        className='inline-flex items-center gap-2 text-neutral-300 hover:text-white'
      >
        <FiArrowLeft />
        Back to products
      </Link>

      <div className='grid gap-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 md:grid-cols-2'>
        {/* Gallery */}
        <div className='grid gap-3'>
          <div className='aspect-4/3 overflow-hidden rounded-xl bg-neutral-800'>
            {images[activeImg] ? (
              <img
                src={images[activeImg]}
                alt={selectedProduct.name}
                className='h-full w-full object-cover'
              />
            ) : null}
          </div>

          {images.length > 1 ? (
            <div className='flex gap-2 overflow-auto pb-1'>
              {images.map((src, idx) => (
                <button
                  key={src + idx}
                  onClick={() => setActiveImg(idx)}
                  className={`h-16 w-24 overflow-hidden rounded-lg border ${
                    idx === activeImg ? 'border-red-500' : 'border-neutral-800'
                  } bg-neutral-800`}
                  type='button'
                >
                  <img
                    src={src}
                    alt=''
                    className='h-full w-full object-cover'
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div className='grid gap-4'>
          <div>
            <div className='inline-flex rounded-full bg-red-600/15 px-3 py-1 text-xs font-semibold text-red-300'>
              {selectedProduct.category}
            </div>
            <h1 className='mt-3 text-2xl font-bold text-white'>
              {selectedProduct.name}
            </h1>
            <p className='mt-2 text-sm text-neutral-400'>
              {selectedProduct.description}
            </p>
          </div>

          <div className='flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-4'>
            <div className='text-2xl font-bold text-white'>
              ${Number(selectedProduct.price).toFixed(2)}
            </div>
            <div className='text-sm text-neutral-400'>
              Stock:{' '}
              <span className='text-neutral-100'>{selectedProduct.stock}</span>
            </div>
          </div>

          <div className='grid gap-2'>
            <label className='text-sm text-neutral-300'>Quantity</label>
            <div className='flex gap-2'>
              <input
                type='number'
                min={1}
                className='w-28 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-red-500'
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
              <button
                disabled={!user}
                onClick={() => addToCart(selectedProduct, qty)}
                className='inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60'
                title={user ? 'Add to cart' : 'Login to add to cart'}
              >
                <FiPlus className='h-4 w-4' />
                Add to cart
              </button>
            </div>
            {!user ? (
              <p className='text-xs text-neutral-500'>
                Please login to add products to cart.
              </p>
            ) : null}
          </div>

          <div className='rounded-xl border border-neutral-800 bg-neutral-950 p-4'>
            <h3 className='font-semibold text-white'>Compatibility</h3>
            {compatibility.length ? (
              <div className='mt-2 flex flex-wrap gap-2'>
                {compatibility.map((c) => (
                  <span
                    key={c}
                    className='rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs text-neutral-200'
                  >
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <p className='mt-2 text-sm text-neutral-400'>
                No compatibility info.
              </p>
            )}
          </div>
        </div>
      </div>

      <ProductReviews productId={productId} user={user} />
    </div>
  );
}