export default function ProductsFilters({
  category,
  onCategory,
  compatibility,
  onCompatibility,
  sortBy,
  sortDir,
  onSortBy,
  onSortDir,
  onReset,
}) {
  return (
    <div className='grid gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 md:grid-cols-2'>
      <div className='grid gap-2'>
        <label className='text-sm text-neutral-300'>Category</label>
        <input
          className='rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-red-500'
          placeholder='e.g. Brakes'
          value={category}
          onChange={(e) => onCategory(e.target.value)}
        />
      </div>

      <div className='grid gap-2'>
        <label className='text-sm text-neutral-300'>
          Compatibility (comma separated)
        </label>
        <input
          className='rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-red-500'
          placeholder='e.g. VW Golf 7 2015, Audi A3 2016'
          value={compatibility.join(', ')}
          onChange={(e) =>
            onCompatibility(
              e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
        />
      </div>

      <div className='grid gap-2'>
        <label className='text-sm text-neutral-300'>Sort by</label>
        <select
          className='rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-red-500'
          value={sortBy}
          onChange={(e) => onSortBy(e.target.value)}
        >
          <option value='createdAt'>Newest</option>
          <option value='name'>Name</option>
          <option value='price'>Price</option>
          <option value='stock'>Stock</option>
        </select>
      </div>

      <div className='grid gap-2'>
        <label className='text-sm text-neutral-300'>Direction</label>
        <select
          className='rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-red-500'
          value={sortDir}
          onChange={(e) => onSortDir(e.target.value)}
        >
          <option value='desc'>DESC</option>
          <option value='asc'>ASC</option>
        </select>
      </div>

      <div className='md:col-span-2'>
        <button
          onClick={onReset}
          type='button'
          className='w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-800'
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}