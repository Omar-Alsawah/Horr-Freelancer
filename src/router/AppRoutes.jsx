import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import SignUpPage from '../features/auth/pages/SignUpPage';
import LoginPage from '../features/auth/pages/LoginPage';
import ClientDashboard from '../features/dashboard/pages/ClientDashboard';
import { PostJobPage } from '../features/jobs';
import JobProposalsPage from '../features/jobs/pages/JobProposalsPage';  // ← only new line added
import SettingsPage from '../features/account/pages/SettingsPage';
import SearchTalentPage from '../features/talent/SearchTalentPage';
import SavedTalentPage from '../features/talent/SavedTalentPage';
import FreelancerDetailsPage from '../features/talent/FreelancerDetailsPage';
import ProtectedRoute from '../components/ProtectedRoute';
import MyContractsPage from '../features/contracts/pages/MyContractsPage';
import ContractDetailsPage from '../features/contracts/pages/ContractDetailsPage';
import ClientDeliveryPortalPage from '../features/contracts/pages/ClientDeliveryPortalPage';
import MessagesPage from '../features/chat/pages/MessagesPage';
import ManageJobPage from '../features/jobs/pages/ManageJobPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/client/post-job" element={<PostJobPage />} />
          <Route path="/client/settings" element={<SettingsPage />} />
          <Route path="/client/search-talent" element={<SearchTalentPage />} />
          <Route path="/client/saved-talent" element={<SavedTalentPage />} />
          <Route path="/client/freelancer/:id" element={<FreelancerDetailsPage />} />
          <Route path="/client/job-proposals" element={<JobProposalsPage />} />
          <Route path="/client/SearchTalentPage" element={<Navigate to="/client/search-talent" replace />} />
          <Route path="/client/contracts" element={<MyContractsPage />} />
          <Route path="/client/contracts/:id" element={<ContractDetailsPage />} />
          <Route path="/client/contracts/:id/deliveries" element={<ClientDeliveryPortalPage />} />
          <Route path="/client/messages" element={<MessagesPage />} />
          <Route path="/client/messages/:chatId" element={<MessagesPage />} />
          <Route path="/client/manage-job/:id" element={<ManageJobPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
