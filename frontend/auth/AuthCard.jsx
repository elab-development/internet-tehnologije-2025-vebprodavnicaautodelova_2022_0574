export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className='mx-auto w-full max-w-md'>
      <div className='rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-white'>
            {title} <span className='text-red-500'>PitStopShop</span>
          </h1>
          {subtitle ? (
            <p className='mt-2 text-sm text-neutral-400'>{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}