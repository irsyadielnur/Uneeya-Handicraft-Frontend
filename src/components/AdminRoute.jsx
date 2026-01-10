import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = [2, 3, 4];

  if (!allowedRoles.includes(user?.role_id)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
