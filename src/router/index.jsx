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
import SubmitProposalPage from '../features/proposals/SubmitProposalPage';
import MyProposalsPage from '../features/proposals/MyProposalsPage';
import ViewProposalPage from '../features/proposals/ViewProposalPage';
import ViewOfferPage from '../features/proposals/ViewOfferPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute requiredRoles={null} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <FindWorkPage /> },
          { path: 'find-work', element: <FindWorkPage /> },
          { path: 'saved-jobs', element: <SavedJobsPage /> },
          { path: 'jobs/:id', element: <JobDetailsPage /> },
          { path: 'proposals/submit', element: <SubmitProposalPage /> },
          { path: 'proposals/my-proposals', element: <MyProposalsPage /> },
          { path: 'proposals/:id', element: <ViewProposalPage /> },
          { path: 'offers/:proposalId', element: <ViewOfferPage /> },
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
