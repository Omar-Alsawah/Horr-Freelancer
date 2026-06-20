import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function ProtectedRoute({ requiredRoles }) {
  const { isAuthenticated, role } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRoles) {
    const userRoles = Array.isArray(role) ? role : [role];
    const hasRole = userRoles.some(r => requiredRoles.includes(r));
    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  return <Outlet />;
}
