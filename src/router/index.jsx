import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import Dashboard from '../pages/Dashboard';
import Unauthorized from '../pages/Unauthorized';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute requiredRoles={null} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'profile', element: <div className="p-8">My Profile Placeholder</div> },
          { path: 'settings', element: <div className="p-8">Settings Placeholder</div> }
        ]
      }
    ]
  },
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Login /> }
    ]
  },
  {
    path: '/register',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Register /> }
    ]
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />
  }
]);

export default router;
