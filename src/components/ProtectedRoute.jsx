import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../features/auth/hooks/useAuth';

const ProtectedRoute = () => {
  const { isAuthenticated, loading, isInitialized } = useAuth();

  if (loading || !isInitialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1a2332', color: '#c4a44a' }}>
        <div className="animate-pulse text-xl font-bold">Verifying Session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
