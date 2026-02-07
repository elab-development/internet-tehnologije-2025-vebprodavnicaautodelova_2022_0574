import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AuthCard from '../components/auth/AuthCard';
import { useAuthStore } from '../stores/authStore';

export default function Register() {
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');

  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await register({ fullName, email, password, role });
      navigate('/');
    } catch {}
  }

  return (
    <div className='py-10'>
      <AuthCard
        title='Create account on'
        subtitle='Register as a customer or mechanic.'
      >
        {error ? (
          <div className='mb-4 rounded-lg border border-red-700/40 bg-red-950/40 px-3 py-2 text-sm text-red-200'>
            {error}
            <button
              className='ml-3 text-xs text-red-300 underline'
              onClick={clearError}
              type='button'
            >
              dismiss
            </button>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className='grid gap-3'>
          <label className='grid gap-1'>
            <span className='text-sm text-neutral-300'>Full name</span>
            <input
              className='rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-red-500'
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder='John Doe'
              required
              minLength={2}
            />
          </label>

          <label className='grid gap-1'>
            <span className='text-sm text-neutral-300'>Email</span>
            <input
              className='rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-red-500'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='you@example.com'
              type='email'
              required
            />
          </label>

          <label className='grid gap-1'>
            <span className='text-sm text-neutral-300'>Password</span>
            <input
              className='rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-red-500'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='min 6 characters'
              type='password'
              required
              minLength={6}
            />
          </label>

          <label className='grid gap-1'>
            <span className='text-sm text-neutral-300'>Role</span>
            <select
              className='rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-red-500'
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value='customer'>Customer</option>
              <option value='mechanic'>Mechanic</option>
            </select>
            <p className='text-xs text-neutral-500'>
              Mechanic can leave technical reviews later.
            </p>
          </label>

          <button
            disabled={isLoading}
            className='mt-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70'
            type='submit'
          >
            {isLoading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <p className='mt-4 text-sm text-neutral-400'>
          Already have an account?{' '}
          <Link
            to='/login'
            className='text-red-400 hover:text-red-300 underline'
          >
            Login
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
