import { Link } from 'react-router-dom';
import heroImg from '../assets/hero.jpg';

export default function Home() {
  return (
    <div className='grid gap-6'>
      <section className='relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950'>
        <div className='relative h-[420px] sm:h-[520px]'>
          <img
            src={heroImg}
            alt='PitStopShop hero'
            className='absolute inset-0 h-full w-full object-cover'
          />
          <div className='absolute inset-0 bg-black/60' />

          <div className='relative z-10 flex h-full items-center justify-center px-4'>
            <div className='mx-auto max-w-3xl text-center'>
              <h1 className='text-3xl font-extrabold tracking-tight text-white sm:text-5xl'>
                PitStop<span className='text-red-500'>Shop</span>
              </h1>

              <p className='mx-auto mt-4 max-w-2xl text-sm text-neutral-200 sm:text-base'>
                Premium auto parts and essentials — fast search, clean ordering,
                and reliable delivery. Keep your ride in top shape.
              </p>

              <div className='mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center'>
                <Link
                  to='/products'
                  className='inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-500'
                >
                  Browse products
                </Link>

                <Link
                  to='/products'
                  className='inline-flex items-center justify-center rounded-lg border border-neutral-700 bg-neutral-950/40 px-5 py-3 text-sm font-semibold text-neutral-100 hover:bg-neutral-900/70'
                >
                  View categories
                </Link>
              </div>

              <div className='mt-4 text-xs text-neutral-300'>
                Secure checkout • Fast shipping • Great support
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='grid gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-6'>
        <h2 className='text-lg font-semibold text-white'>Why PitStopShop?</h2>
        <div className='grid gap-3 sm:grid-cols-3'>
          <div className='rounded-xl border border-neutral-800 bg-neutral-950 p-4'>
            <div className='text-sm font-semibold text-white'>
              Quality parts
            </div>
            <div className='mt-1 text-sm text-neutral-400'>
              Trusted components for everyday maintenance.
            </div>
          </div>
          <div className='rounded-xl border border-neutral-800 bg-neutral-950 p-4'>
            <div className='text-sm font-semibold text-white'>
              Easy ordering
            </div>
            <div className='mt-1 text-sm text-neutral-400'>
              Clean cart, quick checkout, clear order statuses.
            </div>
          </div>
          <div className='rounded-xl border border-neutral-800 bg-neutral-950 p-4'>
            <div className='text-sm font-semibold text-white'>
              Fast delivery
            </div>
            <div className='mt-1 text-sm text-neutral-400'>
              Reliable shipping with address support.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}