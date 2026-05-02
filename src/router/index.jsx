import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import Dashboard from '../pages/Dashboard';
import Unauthorized from '../pages/Unauthorized';
import VerifyEmail from '../pages/VerifyEmail';
import EmailConfirmed from '../pages/EmailConfirmed';
import FindWorkPage from '../features/jobs/FindWorkPage';
import SavedJobsPage from '../features/jobs/SavedJobsPage';
import JobDetailsPage from '../features/jobs/JobDetailsPage';

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
          { path: 'find-work', element: <FindWorkPage /> },
          { path: 'saved-jobs', element: <SavedJobsPage /> },
          { path: 'jobs/:id', element: <JobDetailsPage /> },
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
    path: '/verify-email',
    element: <AuthLayout />,
    children: [
      { index: true, element: <VerifyEmail /> }
    ]
  },
  {
    path: '/email-confirmed',
    element: <AuthLayout />,
    children: [
      { index: true, element: <EmailConfirmed /> }
    ]
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />
  }
]);

export default router;
