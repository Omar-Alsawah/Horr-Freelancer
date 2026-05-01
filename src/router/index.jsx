import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import Home from '../pages/Home';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import Dashboard from '../pages/Dashboard';
import Unauthorized from '../pages/Unauthorized';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'dashboard',
        element: <ProtectedRoute requiredRoles={null} />,
        children: [{ index: true, element: <Dashboard /> }]
      },
      { path: 'unauthorized', element: <Unauthorized /> }
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> }
    ]
  }
]);

export default router;
