import { useEffect } from 'react';
import { useProductsStore } from '../stores/productsStore';
import ProductsSearch from '../components/products/ProductsSearch';
import ProductsFilters from '../components/products/ProductsFilters';
import ProductsGrid from '../components/products/ProductsGrid';
import ProductsPagination from '../components/products/ProductsPagination';

export default function Products() {
  const {
    products,
    page,
    limit,
    totalPages,
    q,
    category,
    compatibility,
    sortBy,
    sortDir,
    isLoading,
    error,
    setQuery,
    resetFilters,
    fetchProducts,
  } = useProductsStore();

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, category, sortBy, sortDir, JSON.stringify(compatibility)]);

  return (
    <div className='grid gap-6'>
      <div className='flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-4'>
        <div className='flex items-end justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold text-white'>
              Products <span className='text-red-500'>Catalog</span>
            </h1>
            <p className='mt-1 text-sm text-neutral-400'>
              Search, filter and sort auto parts.
            </p>
          </div>
        </div>

        <ProductsSearch
          value={q}
          onChange={(val) => setQuery({ q: val, page: 1 })}
          onSubmit={() => fetchProducts()}
        />
      </div>

      <ProductsFilters
        category={category}
        onCategory={(v) => setQuery({ category: v, page: 1 })}
        compatibility={compatibility}
        onCompatibility={(arr) => setQuery({ compatibility: arr, page: 1 })}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortBy={(v) => setQuery({ sortBy: v, page: 1 })}
        onSortDir={(v) => setQuery({ sortDir: v, page: 1 })}
        onReset={() => {
          resetFilters();
          fetchProducts();
        }}
      />

      {error ? (
        <div className='rounded-2xl border border-red-700/40 bg-red-950/40 p-4 text-red-200'>
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className='rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-300'>
          Loading products...
        </div>
      ) : (
        <ProductsGrid products={products} />
      )}

      <ProductsPagination
        page={page}
        totalPages={totalPages}
        onPage={(p) => setQuery({ page: p })}
      />
    </div>
  );
}