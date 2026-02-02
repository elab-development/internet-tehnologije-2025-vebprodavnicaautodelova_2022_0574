export default function ProductsPagination({ page, totalPages, onPage }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className='mt-6 flex items-center justify-center gap-2'>
      <button
        className='rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 disabled:opacity-50'
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Prev
      </button>

      <div className='text-sm text-neutral-400'>
        Page <span className='text-neutral-100'>{page}</span> /{' '}
        <span className='text-neutral-100'>{totalPages}</span>
      </div>

      <button
        className='rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 disabled:opacity-50'
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
}