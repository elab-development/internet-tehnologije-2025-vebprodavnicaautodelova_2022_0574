import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function AppLayout() {
  return (
    <div className='min-h-screen bg-neutral-950 text-neutral-100'>
      <Navbar />
      <main className='mx-auto w-full max-w-6xl px-4 py-8'>
        <Outlet />
      </main>
    </div>
  );
}