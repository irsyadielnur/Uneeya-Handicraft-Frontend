import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFavorites } from './redux/slices/favoriteSlice';
import { Toaster } from 'react-hot-toast';
import './App.css';

import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import AdminRoute from './components/AdminRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import About from './pages/About';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Invoice from './pages/Invoice';
import History from './pages/History';
import Favorite from './pages/Favorite';
import Profile from './pages/Profile';
import Chatbot from './components/Chatbot/Chatbot';
import CustomerServiceChat from './components/RealtimeChat/CustomerServiceChat';
import Footer from './components/Footer';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageProducts from './pages/admin/ManageProducts';
import AdminProductDetail from './pages/admin/AdminProductDetail';
import ProductForm from './pages/admin/ProductForm';
import ManageOrders from './pages/admin/ManageOrders';
import ManageCustomers from './pages/admin/ManageCustomers';
import ManageReports from './pages/admin/ManageReports';
import CreateReport from './pages/admin/CreateReport';
import ReportDetail from './pages/admin/ReportDetail';
import EditReport from './pages/admin/EditReport';
import ValidateReports from './pages/owner/ValidateReports';
import ManageShop from './pages/owner/ManageShop';
import AdminChatDashboard from './pages/admin/AdminChatDashboard';

const AppContent = () => {
  const location = useLocation();
  const hideNavbarPaths = [
    '/login',
    '/register',
    '/verify-otp',
    '/admin/dashboard',
    '/admin/products',
    '/admin/products/create',
    '/admin/products/:id',
    '/admin/products/edit/:id',
    '/admin/orders',
    '/admin/customers',
    '/admin/reports',
    '/admin/reports/create',
    '/admin/reports/:id',
    '/admin/reports/edit/:id',
    '/admin/validate-reports',
    '/admin/settings',
    '/admin/chat',
  ];

  const showLayout = !hideNavbarPaths.some((path) => location.pathname.startsWith(path)) && !['/login', '/register', '/verify-otp'].includes(location.pathname);

  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user.role_id === 1) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, isAuthenticated, user]);

  return (
    <>
      <ScrollToTop />
      <Toaster position="top-center" reverseOrder={false} />
      {showLayout && <Navbar />}

      <div className={`grow ${showLayout ? 'pt-20 min-h-screen bg-cream' : 'min-h-screen bg-cream'}`}>
        <Routes>
          {/* Route untuk Registrasi dan Login */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
          </Route>

          {/* Route untuk Pengunjung */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Catalog />} />
          <Route path="/about" element={<About />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          {/* Route User Login */}
          <Route element={<ProtectedRoute />}>
            <Route path="/favorite" element={<Favorite />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/invoice/:order_id" element={<Invoice />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Route Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <ManageProducts />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/products/:id"
            element={
              <AdminRoute>
                <AdminProductDetail />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/products/create"
            element={
              <AdminRoute>
                <ProductForm />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/products/edit/:id"
            element={
              <AdminRoute>
                <ProductForm />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <ManageOrders />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/customers"
            element={
              <AdminRoute>
                <ManageCustomers />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <ManageReports />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/reports/create"
            element={
              <AdminRoute>
                <CreateReport />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/reports/:id"
            element={
              <AdminRoute>
                <ReportDetail />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/reports/edit/:id"
            element={
              <AdminRoute>
                <EditReport />
              </AdminRoute>
            }
          />

          {/* Route Owner */}
          <Route
            path="/admin/validate-reports"
            element={
              <AdminRoute>
                <ValidateReports />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <ManageShop />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/chat"
            element={
              <AdminRoute>
                <AdminChatDashboard />
              </AdminRoute>
            }
          />
        </Routes>

        {showLayout && <Footer />}
      </div>
      {showLayout && <Chatbot />}
      {showLayout && isAuthenticated && user?.role_id === 1 && <CustomerServiceChat />}
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
