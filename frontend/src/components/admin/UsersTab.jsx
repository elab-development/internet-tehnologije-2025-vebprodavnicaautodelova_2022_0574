import { useEffect, useMemo, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { useUsersStore } from '../../stores/usersStore';
import { useAuthStore } from '../../stores/authStore';

export default function UsersTab() {
  const me = useAuthStore((s) => s.user);

  const {
    users,
    isLoading,
    error,
    success,
    clearMessages,
    fetchAllUsers,
    updateUserRole,
  } = useUsersStore();

  const [roleDraft, setRoleDraft] = useState({});

  useEffect(() => {
    fetchAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const next = {};
    for (const u of users) next[u.id] = u.role;
    setRoleDraft(next);
  }, [users]);

  const roleOptions = useMemo(() => ['customer', 'mechanic', 'admin'], []);

  async function handleSave(userId) {
    clearMessages();
    const role = roleDraft[userId];
    await updateUserRole(userId, role);
  }

  return (
    <div className='min-w-0 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-lg font-semibold text-white'>Users</h2>
          <p className='mt-1 text-sm text-neutral-400'>
            View all users and manage roles.
          </p>
        </div>

        <button
          onClick={() => {
            clearMessages();
            fetchAllUsers();
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
        <table className='w-full min-w-245 table-auto overflow-hidden rounded-xl border border-neutral-800'>
          <thead className='bg-neutral-950'>
            <tr className='text-left text-xs uppercase tracking-wide text-neutral-400'>
              <th className='whitespace-nowrap px-4 py-3'>User</th>
              <th className='whitespace-nowrap px-4 py-3'>Email</th>
              <th className='whitespace-nowrap px-4 py-3'>Role</th>
              <th className='whitespace-nowrap px-4 py-3'>Created</th>
              <th className='whitespace-nowrap px-4 py-3'>Actions</th>
            </tr>
          </thead>

          <tbody className='divide-y divide-neutral-800 bg-neutral-900'>
            {isLoading ? (
              <tr>
                <td className='px-4 py-4 text-sm text-neutral-300' colSpan={5}>
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className='px-4 py-4 text-sm text-neutral-300' colSpan={5}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isMe = me?.id === u.id;

                return (
                  <tr key={u.id} className='align-top'>
                    <td className='px-4 py-3'>
                      <div className='min-w-50 text-sm font-semibold text-white'>
                        {u.fullName}{' '}
                        {isMe ? (
                          <span className='ml-2 rounded-full bg-red-600/15 px-2 py-0.5 text-xs font-semibold text-red-300'>
                            YOU
                          </span>
                        ) : null}
                      </div>
                      <div className='text-xs text-neutral-500'>ID: {u.id}</div>
                    </td>

                    <td className='px-4 py-3 text-sm text-neutral-300'>
                      <div className='min-w-65 wrap-break-word'>{u.email}</div>
                    </td>

                    <td className='px-4 py-3'>
                      <div className='min-w-45'>
                        <select
                          value={roleDraft[u.id] || u.role}
                          onChange={(e) =>
                            setRoleDraft((s) => ({
                              ...s,
                              [u.id]: e.target.value,
                            }))
                          }
                          className='w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-red-500 disabled:opacity-60'
                          disabled={isLoading || isMe}
                          title={
                            isMe
                              ? 'You cannot change your own role here'
                              : 'Change role'
                          }
                        >
                          {roleOptions.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>

                        {isMe ? (
                          <div className='mt-1 text-xs text-neutral-500'>
                            You cannot change your own role.
                          </div>
                        ) : null}
                      </div>
                    </td>

                    <td className='px-4 py-3 text-sm text-neutral-400'>
                      <div className='min-w-35 whitespace-nowrap'>
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString()
                          : '-'}
                      </div>
                    </td>

                    <td className='px-4 py-3'>
                      <div className='min-w-35'>
                        <button
                          onClick={() => handleSave(u.id)}
                          disabled={
                            isLoading || isMe || roleDraft[u.id] === u.role
                          }
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
