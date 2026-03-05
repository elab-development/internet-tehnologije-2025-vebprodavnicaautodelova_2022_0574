import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUsersStore } from '../stores/usersStore';
import { useOrdersStore } from '../stores/ordersStore';
import OrdersList from '../components/profile/OrdersList';

export default function Profile() {
  const user = useAuthStore((s) => s.user);

  const updateMyProfile = useUsersStore((s) => s.updateMyProfile);
  const uLoading = useUsersStore((s) => s.isLoading);
  const uError = useUsersStore((s) => s.error);
  const uSuccess = useUsersStore((s) => s.success);
  const clearMessages = useUsersStore((s) => s.clearMessages);

  const orders = useOrdersStore((s) => s.orders);
  const totalPages = useOrdersStore((s) => s.totalPages);
  const page = useOrdersStore((s) => s.page);
  const isLoadingOrders = useOrdersStore((s) => s.isLoading);
  const oError = useOrdersStore((s) => s.error);
  const setQuery = useOrdersStore((s) => s.setQuery);
  const fetchOrders = useOrdersStore((s) => s.fetchOrders);

  const [fullName, setFullName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    clearMessages();
  }, [clearMessages]);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName || '');
    setDeliveryAddress(user.deliveryAddress || '');
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page]);

  const createdAtText = useMemo(() => {
    if (!user?.createdAt) return '';
    return new Date(user.createdAt).toLocaleString();
  }, [user]);

  if (!user) {
    return (
      <div className='rounded-2xl border border-neutral-800 bg-neutral-900 p-6'>
        <h1 className='text-xl font-bold text-white'>Profile</h1>
        <p className='mt-2 text-neutral-300'>Please login to view profile.</p>
        <Link
          to='/login'
          className='mt-4 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500'
        >
          Go to Login
        </Link>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await updateMyProfile({
        fullName: fullName.trim(),
        deliveryAddress: deliveryAddress.trim() ? deliveryAddress.trim() : null,
      });
    } catch {}
  }

  return (
    <div className='grid gap-6 lg:grid-cols-3'>
      {/* Left: user card + edit */}
      <div className='space-y-6 lg:col-span-1'>
        <div className='rounded-2xl border border-neutral-800 bg-neutral-900 p-5'>
          <h1 className='text-2xl font-bold text-white'>My Profile</h1>
          <p className='mt-1 text-sm text-neutral-400'>
            Manage your personal info and address.
          </p>

          <div className='mt-4 space-y-2 text-sm text-neutral-300'>
            <div>
              <span className='text-neutral-500'>Email:</span>{' '}
              <span className='text-neutral-200'>{user.email}</span>
            </div>
            <div>
              <span className='text-neutral-500'>Role:</span>{' '}
              <span className='text-neutral-200'>{user.role}</span>
            </div>
            <div>
              <span className='text-neutral-500'>Created:</span>{' '}
              <span className='text-neutral-200'>{createdAtText}</span>
            </div>
          </div>
        </div>

        <div className='rounded-2xl border border-neutral-800 bg-neutral-900 p-5'>
          <h2 className='text-lg font-semibold text-white'>Update details</h2>

          <form onSubmit={handleSubmit} className='mt-4 space-y-3'>
            <div>
              <label className='text-sm text-neutral-300'>Full name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className='mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-red-500'
                placeholder='Your full name'
              />
            </div>

            <div>
              <label className='text-sm text-neutral-300'>
                Delivery address
              </label>
              <input
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className='mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-red-500'
                placeholder='Street, number, city...'
              />
              <p className='mt-1 text-xs text-neutral-500'>
                If you leave it empty, address will be removed.
              </p>
            </div>

            {uError ? (
              <div className='rounded-xl border border-red-700/40 bg-red-950/40 p-3 text-sm text-red-200'>
                {uError}
              </div>
            ) : null}

            {uSuccess ? (
              <div className='rounded-xl border border-green-700/40 bg-green-950/40 p-3 text-sm text-green-200'>
                {uSuccess}
              </div>
            ) : null}

            <button
              disabled={uLoading}
              className='w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60'
            >
              {uLoading ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>

      {/* Right: orders */}
      <div className='lg:col-span-2'>
        <div className='rounded-2xl border border-neutral-800 bg-neutral-900 p-5'>
          <div className='flex flex-col justify-between gap-2 md:flex-row md:items-center'>
            <div>
              <h2 className='text-lg font-semibold text-white'>My Orders</h2>
              <p className='mt-1 text-sm text-neutral-400'>
                View order history and open details.
              </p>
            </div>

            <select
              onChange={(e) => {
                setQuery({ status: e.target.value, page: 1 });
                setTimeout(() => fetchOrders(), 0);
              }}
              className='rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-red-500'
              defaultValue=''
            >
              <option value=''>All statuses</option>
              <option value='pending'>pending</option>
              <option value='processing'>processing</option>
              <option value='shipped'>shipped</option>
              <option value='delivered'>delivered</option>
              <option value='cancelled'>cancelled</option>
            </select>
          </div>

          {isLoadingOrders ? (
            <div className='mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300'>
              Loading orders...
            </div>
          ) : oError ? (
            <div className='mt-4 rounded-xl border border-red-700/40 bg-red-950/40 p-4 text-sm text-red-200'>
              {oError}
            </div>
          ) : (
            <div className='mt-4'>
              <OrdersList
                orders={orders}
                page={page}
                totalPages={totalPages}
                onPrev={() => setQuery({ page: Math.max(1, page - 1) })}
                onNext={() => setQuery({ page: page + 1 })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
