import { useEffect, useMemo, useState } from 'react';
import { FiEdit2, FiTrash2, FiStar } from 'react-icons/fi';
import { useTechReviewsStore } from '../../stores/techReviewsStore';

export default function ProductReviews({ productId, user }) {
  const {
    reviews,
    page,
    totalPages,
    isLoading,
    isSubmitting,
    error,
    fetchForProduct,
    createReview,
    updateReview,
    deleteReview,
    setQuery,
    clearError,
  } = useTechReviewsStore();

  const isMechanic = user?.role === 'mechanic';

  useEffect(() => {
    fetchForProduct(productId, { page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const avgRating = useMemo(() => {
    if (!reviews?.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return sum / reviews.length;
  }, [reviews]);

  const myReview = useMemo(() => {
    if (!isMechanic || !user) return null;
    return reviews.find((r) => r.user?.id === user.id) || null;
  }, [reviews, isMechanic, user]);

  const [mode, setMode] = useState('create');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (!isMechanic) return;

    if (myReview) {
      setMode('edit');
      setText(myReview.text || '');
      setRating(Number(myReview.rating || 5));
    } else {
      setMode('create');
      setText('');
      setRating(5);
    }
  }, [myReview, isMechanic]);

  async function handleSubmit(e) {
    e.preventDefault();
    clearError();

    if (!isMechanic) return;
    const payload = {
      productId: Number(productId),
      text,
      rating: Number(rating),
    };

    try {
      if (mode === 'edit' && myReview) {
        await updateReview(myReview.id, {
          text: payload.text,
          rating: payload.rating,
        });
      } else {
        await createReview(payload);
      }
      // refresh da bismo dobili tačan poredak/paginaciju sa backend-a
      await fetchForProduct(productId, { page: 1 });
    } catch {}
  }

  async function handleDelete() {
    if (!myReview) return;
    if (!confirm('Delete your review?')) return;
    try {
      await deleteReview(myReview.id);
      await fetchForProduct(productId, { page: 1 });
    } catch {}
  }

  return (
    <div className='rounded-2xl border border-neutral-800 bg-neutral-900 p-4'>
      <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
        <div>
          <h2 className='text-lg font-semibold text-white'>Tech Reviews</h2>
          <div className='mt-1 flex items-center gap-3 text-sm text-neutral-300'>
            <span className='inline-flex items-center gap-1'>
              <FiStar className='text-red-400' />
              <span className='text-white'>{avgRating.toFixed(1)}</span>
              <span className='text-neutral-500'>/ 5</span>
            </span>
            <span className='text-neutral-500'>•</span>
            <span>
              <span className='text-white'>{reviews.length}</span>{' '}
              <span className='text-neutral-400'>reviews</span>
            </span>
          </div>
        </div>

        <div className='text-xs text-neutral-500'>
          {isMechanic
            ? 'Mechanics can write one review per product.'
            : 'Public reviews.'}
        </div>
      </div>

      {/* Form (mechanic) */}
      {isMechanic ? (
        <form
          onSubmit={handleSubmit}
          className='mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4'
        >
          <div className='flex items-center justify-between'>
            <div className='text-sm font-semibold text-white'>
              {myReview ? 'Your review' : 'Write a review'}
            </div>

            {myReview ? (
              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  onClick={() => setMode('edit')}
                  className='inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800'
                  title='Edit'
                >
                  <FiEdit2 />
                  Edit
                </button>
                <button
                  type='button'
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className='inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-60'
                  title='Delete'
                >
                  <FiTrash2 />
                  Delete
                </button>
              </div>
            ) : null}
          </div>

          <div className='mt-3 grid gap-3 md:grid-cols-4'>
            <div className='md:col-span-1'>
              <label className='text-xs text-neutral-300'>Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className='mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-red-500'
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className='md:col-span-3'>
              <label className='text-xs text-neutral-300'>Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className='mt-1 w-full resize-none rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-red-500'
                placeholder='Write a short technical review...'
              />
            </div>
          </div>

          {error ? (
            <div className='mt-3 rounded-xl border border-red-700/40 bg-red-950/40 p-3 text-sm text-red-200'>
              {error}
            </div>
          ) : null}

          <button
            disabled={isSubmitting}
            className='mt-3 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60'
          >
            {isSubmitting
              ? 'Saving...'
              : myReview
                ? 'Update review'
                : 'Submit review'}
          </button>
        </form>
      ) : null}

      {/* List */}
      <div className='mt-4'>
        {isLoading ? (
          <div className='rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300'>
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className='rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300'>
            No reviews yet.
          </div>
        ) : (
          <div className='space-y-3'>
            {reviews.map((r) => (
              <div
                key={r.id}
                className='rounded-xl border border-neutral-800 bg-neutral-950 p-4'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <div className='text-sm font-semibold text-white'>
                      {r.user?.fullName || 'Unknown'}
                    </div>
                    <div className='mt-1 text-xs text-neutral-500'>
                      {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className='inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs text-neutral-200'>
                    <FiStar className='text-red-400' />
                    {r.rating}
                  </div>
                </div>

                <p className='mt-3 text-sm text-neutral-200'>{r.text}</p>

                {isMechanic && r.user?.id === user?.id ? (
                  <div className='mt-3 text-xs text-neutral-500'>
                    This is your review.
                  </div>
                ) : null}
              </div>
            ))}

            {/* Pagination */}
            <div className='flex items-center justify-between pt-1'>
              <button
                disabled={page <= 1}
                onClick={() => {
                  setQuery({ page: Math.max(1, page - 1) });
                  fetchForProduct(productId, { page: Math.max(1, page - 1) });
                }}
                className='rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 disabled:opacity-60'
              >
                Prev
              </button>

              <div className='text-sm text-neutral-400'>
                Page <span className='text-neutral-200'>{page}</span> /{' '}
                <span className='text-neutral-200'>{totalPages || 1}</span>
              </div>

              <button
                disabled={page >= (totalPages || 1)}
                onClick={() => {
                  setQuery({ page: page + 1 });
                  fetchForProduct(productId, { page: page + 1 });
                }}
                className='rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 disabled:opacity-60'
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
