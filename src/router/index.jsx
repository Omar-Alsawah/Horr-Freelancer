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
import MyContractsPage from '../features/contracts/MyContractsPage';
import ContractDetailsPage from '../features/contracts/ContractDetailsPage';
import MyProfilePage from '../features/profile/MyProfilePage';
import SettingsPage from '../features/profile/SettingsPage';
import ProfileSettingsPage from '../features/profile/ProfileSettingsPage';
import PasswordSecurityPage from '../features/profile/PasswordSecurityPage';
import PublicProfilePage from '../features/profile/PublicProfilePage';
import VerificationPage from '../features/verification/VerificationPage';
import DeliverySubmitPage from '../features/contracts/DeliverySubmitPage';
import DeliveryReviewPage from '../features/contracts/DeliveryReviewPage';
import MilestoneFundingPage from '../features/contracts/MilestoneFundingPage';
import EscrowBreakdownPage from '../features/contracts/EscrowBreakdownPage';
import DisputeManagementPage from '../features/admin/DisputeManagementPage';
import RevisionQueuePage from '../features/specialist/RevisionQueuePage';

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
          { path: 'contracts/my-contracts', element: <MyContractsPage /> },
          { path: 'contracts/:id', element: <ContractDetailsPage /> },
          { path: 'contracts/:contractId/escrow', element: <EscrowBreakdownPage /> },
          { path: 'contracts/:contractId/milestones', element: <MilestoneFundingPage /> },
          { path: 'contracts/:contractId/deliver', element: <DeliverySubmitPage /> },
          { path: 'contracts/:contractId/milestones/:milestoneId/deliver', element: <DeliverySubmitPage /> },
          { path: 'contracts/:contractId/deliveries/:deliveryId', element: <DeliveryReviewPage /> },
          { path: 'profile', element: <MyProfilePage /> },
          { path: 'profile/:userIdHash/public', element: <PublicProfilePage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'settings/profile', element: <ProfileSettingsPage /> },
          { path: 'settings/password', element: <PasswordSecurityPage /> },
          { path: 'settings/verification', element: <VerificationPage /> },
          { path: 'settings/billing', element: <div className="p-8 font-bold text-2xl">Get Paid Placeholder</div> }
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
