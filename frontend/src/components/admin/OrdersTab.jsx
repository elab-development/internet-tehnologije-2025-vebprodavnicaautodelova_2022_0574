import { useEffect, useMemo, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useOrdersStore } from '../../stores/ordersStore';

const STATUS_OPTIONS = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

function formatMoney(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return '-';
  return `$${num.toFixed(2)}`;
}

export default function OrdersTab() {
  const {
    orders,
    isLoading,
    isSaving,
    error,
    success,
    clearMessages,
    fetchOrders,
    updateOrderStatus,
  } = useOrdersStore();

  const [statusDraft, setStatusDraft] = useState({});

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const next = {};
    for (const o of orders) next[o.id] = o.status;
    setStatusDraft(next);
  }, [orders]);

  const sorted = useMemo(() => {
    return Array.isArray(orders) ? orders : [];
  }, [orders]);

  async function handleSave(orderId) {
    clearMessages();
    const nextStatus = statusDraft[orderId];

    await updateOrderStatus(orderId, nextStatus);
    await fetchOrders();
  }

  return (
    <div className='min-w-0 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-lg font-semibold text-white'>Orders</h2>
          <p className='mt-1 text-sm text-neutral-400'>
            View all orders and update their statuses.
          </p>
        </div>

        <button
          onClick={() => {
            clearMessages();
            fetchOrders();
          }}
          disabled={isLoading}
          className='inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-800 disabled:opacity-60'
          type='button'
        >
          <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
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
              <th className='whitespace-nowrap px-4 py-3'>Order</th>
              <th className='whitespace-nowrap px-4 py-3'>User</th>
              <th className='whitespace-nowrap px-4 py-3'>Status</th>
              <th className='whitespace-nowrap px-4 py-3'>Total</th>
              <th className='whitespace-nowrap px-4 py-3'>Address</th>
              <th className='whitespace-nowrap px-4 py-3'>Created</th>
              <th className='whitespace-nowrap px-4 py-3'>Updated</th>
              <th className='whitespace-nowrap px-4 py-3'>Actions</th>
            </tr>
          </thead>

          <tbody className='divide-y divide-neutral-800 bg-neutral-900'>
            {isLoading ? (
              <tr>
                <td className='px-4 py-4 text-sm text-neutral-300' colSpan={8}>
                  Loading orders...
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td className='px-4 py-4 text-sm text-neutral-300' colSpan={8}>
                  No orders found.
                </td>
              </tr>
            ) : (
              sorted.map((o) => {
                const delivered = o.status === 'delivered';
                const nextStatus = statusDraft[o.id] || o.status;

                const canEdit = !delivered && !isLoading && !isSaving;
                const canSave =
                  !delivered &&
                  !isLoading &&
                  !isSaving &&
                  nextStatus !== o.status;

                return (
                  <tr key={o.id} className='align-top'>
                    <td className='px-4 py-3'>
                      <div className='min-w-35 text-sm font-semibold text-white'>
                        <Link
                          to={`/orders/${o.id}`}
                          className='underline decoration-neutral-700 underline-offset-4 hover:decoration-neutral-300'
                          title='Open order'
                        >
                          #{o.id}
                        </Link>
                      </div>
                      <div className='text-xs text-neutral-500'>
                        {delivered ? 'Finalized' : 'Editable'}
                      </div>
                    </td>

                    <td className='px-4 py-3 text-sm text-neutral-200'>
                      <div className='min-w-30 whitespace-nowrap'>
                        User ID: {o.userId}
                      </div>
                    </td>

                    <td className='px-4 py-3'>
                      <div className='min-w-45'>
                        <select
                          value={nextStatus}
                          onChange={(e) =>
                            setStatusDraft((s) => ({
                              ...s,
                              [o.id]: e.target.value,
                            }))
                          }
                          disabled={!canEdit}
                          className='w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-red-500 disabled:opacity-60'
                          title={
                            delivered
                              ? 'Delivered orders cannot be modified'
                              : 'Change status'
                          }
                        >
                          {STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>

                        {delivered ? (
                          <div className='mt-1 text-xs text-neutral-500'>
                            Delivered orders cannot be modified.
                          </div>
                        ) : null}
                      </div>
                    </td>

                    <td className='px-4 py-3 text-sm text-neutral-200'>
                      <div className='min-w-30 whitespace-nowrap'>
                        {formatMoney(o.totalAmount)}
                      </div>
                    </td>

                    <td className='px-4 py-3 text-sm text-neutral-200'>
                      <div className='min-w-[320px] wrap-break-word'>
                        {o.address || '-'}
                      </div>
                    </td>

                    <td className='px-4 py-3 text-sm text-neutral-400'>
                      <div className='min-w-35 whitespace-nowrap'>
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleDateString()
                          : '-'}
                      </div>
                    </td>

                    <td className='px-4 py-3 text-sm text-neutral-400'>
                      <div className='min-w-35 whitespace-nowrap'>
                        {o.updatedAt
                          ? new Date(o.updatedAt).toLocaleDateString()
                          : '-'}
                      </div>
                    </td>

                    <td className='px-4 py-3'>
                      <div className='min-w-35'>
                        <button
                          onClick={() => handleSave(o.id)}
                          disabled={!canSave}
                          className='w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60'
                          type='button'
                        >
                          Save
                        </button>
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
    </div>
  );
}
