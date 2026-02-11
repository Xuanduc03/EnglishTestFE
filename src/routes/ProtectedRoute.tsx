import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const checkPermission = (allowedRoles: string[]): boolean => {
  const userStr = localStorage.getItem("user");

  if (!userStr) return false;

  try {
    const userData = JSON.parse(userStr);
    const userRoles = userData.roles || [];
    if (Array.isArray(userRoles)) {
      return allowedRoles.some(role => userRoles.includes(role));
    }
    return false;
  } catch (error) {
    return false;
  }
}

interface ProtectedRouteProps {
  allowedRoles: string[]; 
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const isAllowed = checkPermission(allowedRoles);

  // Nếu có quyền -> Cho đi tiếp vào các Route con (Outlet)
  // Nếu không -> Đá về trang login
  return isAllowed ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;   