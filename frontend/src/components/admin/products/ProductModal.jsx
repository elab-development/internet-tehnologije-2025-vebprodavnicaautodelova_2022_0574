import { useEffect, useMemo, useState } from 'react';
import { FiX, FiUpload, FiTrash2 } from 'react-icons/fi';

function normalizeCompatibility(value) {
  if (Array.isArray(value))
    return value
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function imagesToView(product) {
  const arr = Array.isArray(product?.images) ? product.images : [];
  return arr
    .map((img) => ({
      publicId: img?.publicId,
      url: img?.url || img?.secureUrl,
    }))
    .filter((x) => x.url);
}

export default function ProductModal({
  open,
  mode,
  initialProduct,
  isSaving,
  onClose,
  onSubmit,
}) {
  const isEdit = mode === 'edit';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('1');
  const [stock, setStock] = useState('1');
  const [category, setCategory] = useState('');
  const [compatText, setCompatText] = useState('');

  const [newFiles, setNewFiles] = useState([]);
  const [removeMap, setRemoveMap] = useState({});

  const existingImages = useMemo(
    () => (isEdit ? imagesToView(initialProduct) : []),
    [isEdit, initialProduct],
  );

  useEffect(() => {
    if (!open) return;

    if (isEdit && initialProduct) {
      setName(initialProduct.name || '');
      setDescription(initialProduct.description || '');
      setPrice(String(initialProduct.price ?? '1'));
      setStock(String(initialProduct.stock ?? '1'));
      setCategory(initialProduct.category || '');

      const compArr = normalizeCompatibility(initialProduct.compatibility);
      setCompatText(compArr.join(', '));

      setNewFiles([]);
      setRemoveMap({});
    } else {
      setName('');
      setDescription('');
      setPrice('1');
      setStock('1');
      setCategory('');
      setCompatText('');
      setNewFiles([]);
      setRemoveMap({});
    }
  }, [open, isEdit, initialProduct]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const markedToRemove = Object.entries(removeMap)
    .filter(([, v]) => v)
    .map(([pid]) => pid);

  const visibleExisting = existingImages.filter(
    (img) => !removeMap[img.publicId],
  );

  const finalCompatibility = normalizeCompatibility(compatText);

  const createNeedsImages = !isEdit && newFiles.length < 1;
  const editWouldHaveZeroImages =
    isEdit && visibleExisting.length < 1 && newFiles.length < 1;

  const canSubmit =
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    category.trim().length > 0 &&
    Number(price) > 0 &&
    Number.isFinite(Number(price)) &&
    Number(stock) >= 0 &&
    Number.isFinite(Number(stock)) &&
    finalCompatibility.length > 0 &&
    !createNeedsImages &&
    !editWouldHaveZeroImages &&
    !isSaving;

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      stock: Number(stock),
      category: category.trim(),
      compatibility: finalCompatibility,
      imagesFiles: newFiles,
    };

    if (isEdit) payload.imagesToRemove = markedToRemove;

    await onSubmit(payload);
  }

  return (
    <div className='fixed inset-0 z-9999 flex items-center justify-center p-4'>
      {/* Dark overlay behind */}
      <button
        className='absolute inset-0 bg-black/60'
        onClick={onClose}
        type='button'
        aria-label='Close modal backdrop'
      />

      {/* Modal */}
      <div
        className='relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-xl'
        role='dialog'
        aria-modal='true'
      >
        <div className='flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 py-3'>
          <div>
            <h3 className='text-base font-semibold text-white'>
              {isEdit ? 'Edit product' : 'Create product'}
            </h3>
            <p className='text-xs text-neutral-400'>
              {isEdit
                ? 'Update fields, add/remove images, and save changes.'
                : 'Fill in details, add at least one image, and create.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className='inline-flex items-center justify-center rounded-lg p-2 text-neutral-200 hover:bg-neutral-800 hover:text-white'
            type='button'
            aria-label='Close'
          >
            <FiX className='h-5 w-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='grid gap-4 p-4 sm:p-5'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='grid gap-2'>
              <label className='text-sm font-medium text-neutral-200'>
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-red-500'
                placeholder='e.g. Brake pads'
              />
            </div>

            <div className='grid gap-2'>
              <label className='text-sm font-medium text-neutral-200'>
                Category
              </label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className='rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-red-500'
                placeholder='e.g. Brakes'
              />
            </div>

            <div className='grid gap-2'>
              <label className='text-sm font-medium text-neutral-200'>
                Price
              </label>
              <input
                type='number'
                min='0.01'
                step='0.01'
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className='rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-red-500'
              />
            </div>

            <div className='grid gap-2'>
              <label className='text-sm font-medium text-neutral-200'>
                Stock
              </label>
              <input
                type='number'
                min='0'
                step='1'
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className='rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-red-500'
              />
            </div>
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium text-neutral-200'>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className='rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-red-500'
              placeholder='Short technical description...'
            />
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium text-neutral-200'>
              Compatibility (comma separated)
            </label>
            <input
              value={compatText}
              onChange={(e) => setCompatText(e.target.value)}
              className='rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-red-500'
              placeholder='e.g. BMW 320d 2018, Audi A4 2016'
            />
            <p className='text-xs text-neutral-500'>
              Must contain at least one value.
            </p>
          </div>

          {isEdit ? (
            <div className='grid gap-2'>
              <div className='flex items-center justify-between'>
                <label className='text-sm font-medium text-neutral-200'>
                  Existing images
                </label>
                <span className='text-xs text-neutral-500'>
                  Click a tile to mark for removal
                </span>
              </div>

              {existingImages.length ? (
                <div className='flex flex-wrap gap-2'>
                  {existingImages.map((img) => {
                    const marked = !!removeMap[img.publicId];
                    return (
                      <button
                        key={img.publicId || img.url}
                        type='button'
                        onClick={() =>
                          setRemoveMap((s) => ({
                            ...s,
                            [img.publicId]: !s[img.publicId],
                          }))
                        }
                        className={[
                          'relative h-20 w-28 overflow-hidden rounded-lg border',
                          marked ? 'border-red-500' : 'border-neutral-800',
                          'bg-neutral-950',
                        ].join(' ')}
                        title={marked ? 'Marked for removal' : 'Keep image'}
                      >
                        <img
                          src={img.url}
                          alt=''
                          className={[
                            'h-full w-full object-cover',
                            marked ? 'opacity-40' : 'opacity-100',
                          ].join(' ')}
                        />
                        {marked ? (
                          <span className='absolute inset-0 flex items-center justify-center text-xs font-semibold text-red-200'>
                            REMOVE
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className='rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-400'>
                  No existing images.
                </div>
              )}

              {editWouldHaveZeroImages ? (
                <div className='rounded-xl border border-red-700/40 bg-red-950/40 p-3 text-sm text-red-200'>
                  Product must have at least one image (either keep one existing
                  or add a new one).
                </div>
              ) : null}
            </div>
          ) : null}

          <div className='grid gap-2'>
            <label className='text-sm font-medium text-neutral-200'>
              {isEdit ? 'Add new images' : 'Images (at least 1)'}
            </label>

            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <input
                type='file'
                accept='image/*'
                multiple
                onChange={(e) => setNewFiles(Array.from(e.target.files || []))}
                className='block w-full text-sm text-neutral-200 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-neutral-700'
              />

              <div className='text-xs text-neutral-500'>
                {newFiles.length
                  ? `${newFiles.length} selected`
                  : 'No files selected'}
              </div>
            </div>

            {createNeedsImages ? (
              <div className='rounded-xl border border-red-700/40 bg-red-950/40 p-3 text-sm text-red-200'>
                Please select at least one image.
              </div>
            ) : null}

            {newFiles.length ? (
              <div className='mt-1 flex flex-wrap gap-2'>
                {newFiles.map((f) => (
                  <span
                    key={f.name + f.size}
                    className='inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1 text-xs text-neutral-200'
                  >
                    <FiUpload className='text-red-400' />
                    {f.name}
                    <button
                      type='button'
                      onClick={() =>
                        setNewFiles((arr) => arr.filter((x) => x !== f))
                      }
                      className='ml-1 inline-flex items-center justify-center rounded-full p-1 hover:bg-neutral-800'
                      title='Remove file'
                    >
                      <FiTrash2 className='h-3 w-3 text-neutral-300' />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className='mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-800'
            >
              Cancel
            </button>

            <button
              type='submit'
              disabled={!canSubmit}
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60'
            >
              {isSaving ? (
                <span className='inline-flex items-center gap-2'>
                  <span className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                  Saving...
                </span>
              ) : (
                <span>{isEdit ? 'Save changes' : 'Create product'}</span>
              )}
            </button>
          </div>

          {isEdit && markedToRemove.length ? (
            <div className='text-xs text-neutral-500'>
              Marked for removal: {markedToRemove.length}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
