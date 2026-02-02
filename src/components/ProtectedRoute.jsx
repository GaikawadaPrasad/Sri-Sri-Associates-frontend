import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

    // console.log('ProtectedRoute - User:', user, 'Role Required:', role);
  if (loading) {
    toast.info("Checking authentication...");
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  
  if (!user) {
    toast.error("You must be logged in to access this page");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  
  
  if (role && user.role !== role) {
    const redirectPath = user.role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard';
    toast.error("You do not have permission to access this page");
    return <Navigate to={redirectPath} replace />;
  }

  
  return children;
};

export default ProtectedRoute;