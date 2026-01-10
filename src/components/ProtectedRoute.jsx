import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) {
    toast.error('Akses ditolak, silakan login.');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
