import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AuthCard from '../components/auth/AuthCard';
import { useAuthStore } from '../stores/authStore';

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/');
    } catch {}
  }

  return (
    <div className='py-10'>
      <AuthCard
        title='Login to'
        subtitle='Sign in to access your orders, profile and more.'
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
              placeholder='••••••••'
              type='password'
              required
              minLength={6}
            />
          </label>

          <button
            disabled={isLoading}
            className='mt-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70'
            type='submit'
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className='mt-4 text-sm text-neutral-400'>
          Don’t have an account?{' '}
          <Link
            to='/register'
            className='text-red-400 hover:text-red-300 underline'
          >
            Register
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}