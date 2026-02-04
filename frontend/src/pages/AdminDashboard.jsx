import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

import UsersTab from '../components/admin/UsersTab';
import ProductsTab from '../components/admin/ProductsTab';
import OrdersTab from '../components/admin/OrdersTab';

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState('users'); // users | products | orders

  const isAdmin = user?.role === 'admin';

  const tabs = useMemo(
    () => [
      { key: 'users', label: 'Users' },
      { key: 'products', label: 'Products' },
      { key: 'orders', label: 'Orders' },
    ],
    [],
  );

  if (!user) return <Navigate to='/login' replace />;
  if (!isAdmin) return <Navigate to='/' replace />;

  return (
    <div className='grid gap-6'>
      <div className='rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5'>
        <h1 className='text-xl font-bold text-white sm:text-2xl'>
          Admin Dashboard
        </h1>
        <p className='mt-1 text-sm text-neutral-400'>
          Manage users, products and orders.
        </p>

        {/* Tabs */}
        <div className='mt-4 rounded-xl border border-neutral-800 bg-neutral-950'>
          {/* Mobile tabs (scrollable) */}
          <div className='flex overflow-x-auto sm:hidden'>
            {tabs.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={[
                    'shrink-0 px-4 py-3 text-sm font-semibold transition-colors',
                    'border-r border-neutral-800 last:border-r-0',
                    active
                      ? 'bg-red-600 text-white'
                      : 'text-neutral-200 hover:bg-neutral-900',
                  ].join(' ')}
                  type='button'
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Desktop tabs */}
          <div className='hidden sm:grid sm:grid-cols-3'>
            {tabs.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={[
                    'px-4 py-3 text-sm font-semibold transition-colors',
                    'border-r border-neutral-800 last:border-r-0',
                    active
                      ? 'bg-red-600 text-white'
                      : 'text-neutral-200 hover:bg-neutral-900',
                  ].join(' ')}
                  type='button'
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      {tab === 'users' ? <UsersTab /> : null}
      {tab === 'products' ? <ProductsTab /> : null}
      {tab === 'orders' ? <OrdersTab /> : null}
    </div>
  );
}