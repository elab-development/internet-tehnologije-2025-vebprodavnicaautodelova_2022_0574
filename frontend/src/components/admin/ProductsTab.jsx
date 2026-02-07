import { useEffect, useMemo, useState } from 'react';
import { FiEdit2, FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { useProductsStore } from '../../stores/productsStore';
import ProductModal from './products/ProductModal';

export default function ProductsTab() {
  const {
    products,
    isLoading,
    isSaving,
    error,
    success,
    clearMessages,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProductsStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = useMemo(() => {
    return Array.isArray(products) ? products : [];
  }, [products]);

  function openCreate() {
    clearMessages();
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(p) {
    clearMessages();
    setEditing(p);
    setModalOpen(true);
  }

  async function handleDelete(p) {
    clearMessages();
    const ok = confirm(
      `Deactivate product "${p.name}"?\n(This will remove it from public listing.)`,
    );
    if (!ok) return;

    await deleteProduct(p.id);
    await fetchProducts();
  }

  async function handleSubmit(form) {
    clearMessages();

    if (editing) {
      await updateProduct(editing.id, form);
    } else {
      await createProduct(form);
    }

    setModalOpen(false);
    setEditing(null);
    await fetchProducts();
  }

  return (
    <div
      className={[
        'min-w-0 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5',
        modalOpen ? 'overflow-visible' : 'overflow-hidden',
      ].join(' ')}
    >
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-lg font-semibold text-white'>Products</h2>
          <p className='mt-1 text-sm text-neutral-400'>
            Create, edit and deactivate products.
          </p>
        </div>

        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
          <button
            onClick={() => {
              clearMessages();
              fetchProducts();
            }}
            disabled={isLoading}
            className='inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-800 disabled:opacity-60'
            type='button'
          >
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={openCreate}
            className='inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500'
            type='button'
          >
            <FiPlus />
            New product
          </button>
        </div>
      </div>

      {error ? (
        <div className='mt-4 rounded-xl border border-red-700/40 bg-red-950/40 p-4 text-sm text-red-200'>
          {error}
        </div>
      ) : null}

      {success ? (
        <div className='mt-4 rounded-xl border border-green-700/40 bg-green-950/30 p-4 text-sm text-green-200'>
          {success}
        </div>
      ) : null}

      <div className='mt-4 -mx-4 min-w-0 max-w-full overflow-x-auto px-4'>
        <table className='w-full min-w-275 table-auto overflow-hidden rounded-xl border border-neutral-800'>
          <thead className='bg-neutral-950'>
            <tr className='text-left text-xs uppercase tracking-wide text-neutral-400'>
              <th className='whitespace-nowrap px-4 py-3'>Product</th>
              <th className='whitespace-nowrap px-4 py-3'>Category</th>
              <th className='whitespace-nowrap px-4 py-3'>Price</th>
              <th className='whitespace-nowrap px-4 py-3'>Stock</th>
              <th className='whitespace-nowrap px-4 py-3'>Created</th>
              <th className='whitespace-nowrap px-4 py-3'>Actions</th>
            </tr>
          </thead>

          <tbody className='divide-y divide-neutral-800 bg-neutral-900'>
            {isLoading ? (
              <tr>
                <td className='px-4 py-4 text-sm text-neutral-300' colSpan={6}>
                  Loading products...
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td className='px-4 py-4 text-sm text-neutral-300' colSpan={6}>
                  No products found.
                </td>
              </tr>
            ) : (
              sorted.map((p) => {
                const img =
                  Array.isArray(p.images) && p.images[0]
                    ? p.images[0]?.url || p.images[0]?.secureUrl
                    : null;

                return (
                  <tr key={p.id} className='align-top'>
                    <td className='px-4 py-3'>
                      <div className='flex min-w-[320px] items-start gap-3'>
                        <div className='h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950'>
                          {img ? (
                            <img
                              src={img}
                              alt={p.name}
                              className='h-full w-full object-cover'
                            />
                          ) : null}
                        </div>
                        <div className='min-w-0'>
                          <div className='truncate text-sm font-semibold text-white'>
                            {p.name}
                          </div>
                          <div className='mt-0.5 text-xs text-neutral-500'>
                            ID: {p.id}
                          </div>
                          <div className='mt-1 line-clamp-2 text-xs text-neutral-400'>
                            {p.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className='px-4 py-3'>
                      <div className='min-w-45 text-sm text-neutral-200'>
                        {p.category}
                      </div>
                    </td>

                    <td className='px-4 py-3 text-sm text-neutral-200'>
                      <div className='min-w-30 whitespace-nowrap'>
                        ${Number(p.price).toFixed(2)}
                      </div>
                    </td>

                    <td className='px-4 py-3 text-sm text-neutral-200'>
                      <div className='min-w-25 whitespace-nowrap'>
                        {p.stock}
                      </div>
                    </td>

                    <td className='px-4 py-3 text-sm text-neutral-400'>
                      <div className='min-w-35 whitespace-nowrap'>
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString()
                          : '-'}
                      </div>
                    </td>

                    <td className='px-4 py-3'>
                      <div className='min-w-45'>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => openEdit(p)}
                            className='inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-800'
                            type='button'
                          >
                            <FiEdit2 />
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(p)}
                            disabled={isSaving}
                            className='inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60'
                            type='button'
                            title='Deactivate'
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className='mt-3 text-xs text-neutral-500 sm:hidden'>
        Tip: swipe horizontally to see the whole table.
      </p>

      <ProductModal
        open={modalOpen}
        mode={editing ? 'edit' : 'create'}
        initialProduct={editing}
        isSaving={isSaving}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
