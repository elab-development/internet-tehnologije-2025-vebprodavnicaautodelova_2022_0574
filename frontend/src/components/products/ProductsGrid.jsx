import ProductCard from './ProductCard';

export default function ProductsGrid({ products }) {
  if (!products?.length) {
    return (
      <div className='rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-300'>
        No products found.
      </div>
    );
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}