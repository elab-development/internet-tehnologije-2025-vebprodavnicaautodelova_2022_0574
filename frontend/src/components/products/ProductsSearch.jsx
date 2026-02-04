import { useState } from 'react';

export default function ProductsSearch({ value, onChange, onSubmit }) {
  const [local, setLocal] = useState(value || '');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onChange(local);
        onSubmit();
      }}
      className='flex gap-2'
    >
      <input
        className='w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-red-500'
        placeholder='Search by name, description, category...'
        value={local}
        onChange={(e) => setLocal(e.target.value)}
      />
      <button className='rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500'>
        Search
      </button>
    </form>
  );
}