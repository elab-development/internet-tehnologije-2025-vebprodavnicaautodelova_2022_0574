import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { useAuthStore } from './stores/authStore';

import AppLayout from './layouts/AppLayout';
import RequireAuth from './components/auth/RequireAuth';
import RequireGuest from './components/auth/RequireGuest';
import RequireAdmin from './components/auth/RequireAdmin';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';

import Login from './pages/Login';
import Register from './pages/Register';

import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderDetails from './pages/OrderDetails';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Public */}
          <Route path='/' element={<Home />} />
          <Route path='/products' element={<Products />} />
          <Route path='/products/:productId' element={<ProductDetails />} />

          {/* Guest-only */}
          <Route element={<RequireGuest />}>
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
          </Route>

          {/* Auth-only */}
          <Route element={<RequireAuth />}>
            <Route path='/profile' element={<Profile />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/checkout' element={<Checkout />} />
            <Route path='/orders/:orderId' element={<OrderDetails />} />
          </Route>

          {/* Admin-only */}
          <Route element={<RequireAdmin />}>
            <Route path='/admin' element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;