import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FiMenu,
  FiX,
  FiShoppingCart,
  FiChevronDown,
  FiUser,
} from 'react-icons/fi';

import LogoImg from '../assets/logo.png';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartCount = useCartStore((s) => s.itemsCount);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const ddRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onDocClick(e) {
      if (!ddRef.current) return;
      if (!ddRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  async function handleLogout() {
    await logout();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate('/');
  }

  const linkBase = 'px-3 py-2 rounded-md text-sm font-medium transition-colors';
  const active = 'bg-red-600 text-white';
  const inactive = 'text-neutral-200 hover:text-white hover:bg-neutral-800';

  const guestLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Register' },
  ];

  const authedLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
  ];

  return (
    <header className='sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur'>
      <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-4'>
        {/* Left: brand */}
        <Link to='/' className='flex items-center gap-3'>
          <img
            src={LogoImg}
            alt='PitStopShop'
            className='h-9 w-9 rounded-md object-cover'
          />
          <span className='text-lg font-bold tracking-wide'>
            <span className='text-white'>PitStop</span>
            <span className='text-red-500'>Shop</span>
          </span>
        </Link>

        {/* Right: desktop */}
        <nav className='hidden items-center gap-2 md:flex'>
          {(user ? authedLinks : guestLinks).map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : inactive}`
              }
            >
              {l.label}
            </NavLink>
          ))}

          {user ? (
            <div className='ml-2 flex items-center gap-2'>
              <Link
                to='/cart'
                className='relative inline-flex items-center justify-center rounded-md px-3 py-2 text-neutral-200 hover:bg-neutral-800 hover:text-white'
                title='Cart'
              >
                <FiShoppingCart className='h-5 w-5' />
                {cartCount > 0 ? (
                  <span className='absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white'>
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                ) : null}
              </Link>

              {/* Profile dropdown */}
              <div className='relative' ref={ddRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className='inline-flex items-center gap-2 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800'
                >
                  <FiUser className='h-4 w-4 text-red-500' />
                  <span className='max-w-[140px] truncate'>
                    {user.fullName}
                  </span>
                  <FiChevronDown className='h-4 w-4 text-neutral-300' />
                </button>

                {profileOpen && (
                  <div className='absolute right-0 mt-2 w-48 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 shadow-lg'>
                    <div className='px-3 py-2 text-xs text-neutral-400'>
                      Signed in as{' '}
                      <span className='text-neutral-200'>{user.role}</span>
                    </div>
                    <div className='h-px bg-neutral-800' />
                    <Link
                      to='/profile'
                      onClick={() => setProfileOpen(false)}
                      className='block px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800'
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className='block w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800'
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className='inline-flex items-center justify-center rounded-md p-2 text-neutral-200 hover:bg-neutral-800 hover:text-white md:hidden'
          aria-label='Toggle menu'
        >
          {mobileOpen ? (
            <FiX className='h-6 w-6' />
          ) : (
            <FiMenu className='h-6 w-6' />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className='border-t border-neutral-800 md:hidden'>
          <div className='mx-auto max-w-6xl px-4 py-3'>
            <div className='flex flex-col gap-2'>
              {(user ? authedLinks : guestLinks).map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? active : inactive}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}

              {user ? (
                <>
                  <Link
                    to='/cart'
                    onClick={() => setMobileOpen(false)}
                    className={`${linkBase} ${inactive} flex items-center gap-2`}
                  >
                    <FiShoppingCart className='h-5 w-5' />
                    Cart
                    <span className='ml-auto rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white'>
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  </Link>
                  <Link
                    to='/profile'
                    onClick={() => setMobileOpen(false)}
                    className={`${linkBase} ${inactive}`}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`${linkBase} ${inactive} text-left`}
                  >
                    Logout
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}