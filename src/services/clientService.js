import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

export const getClientProfile = async (options = {}) => {
  const response = await apiClient.get(ENDPOINTS.CLIENT.ME, options);
  return response.data;
};

export const getOnboardingStatus = async () => {
  const response = await apiClient.get(ENDPOINTS.CLIENT.ONBOARDING);
  return response.data;
};

// Jobs

export const getClientJobs = async (options = {}) => {
  const response = await apiClient.get(ENDPOINTS.CLIENT.JOBS, options);
  return response.data;
};

export const sendConversationMessage = async (conversationId, { body, jobPostId, receiverId }) => {
  const formData = new FormData();
  formData.append('body', body);
  formData.append('jobPostId', jobPostId);
  formData.append('receiverId', receiverId);

  // Ensure the request is sent as multipart/form-data. This request-level header
  // overrides the apiClient default 'application/json' header so the browser
  // includes the proper multipart boundary.
  const response = await apiClient.post(
    ENDPOINTS.CONVERSATIONS.SEND_MESSAGE.replace('{conversationId}', conversationId),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

export const updateJob = async (jobId, jobData) => {
  const response = await apiClient.put(`${ENDPOINTS.JOBS.UPDATE}/${jobId}`, jobData);
  return response.data;
};

export const deleteJob = async (jobId) => {
  const response = await apiClient.delete(`${ENDPOINTS.JOBS.DELETE}/${jobId}`);
  return response.data;
};

// Profile & Settings
export const getUserProfile = async () => {
  const response = await apiClient.get(ENDPOINTS.USER_PROFILE.BASE);
  // Extract data wrapper if present (common in .NET responses)
  return response.data?.data || response.data;
};

export const updateName = async (name) => {
  // The API expects a raw string in the body for these patch endpoints
  const response = await apiClient.patch(ENDPOINTS.USER_PROFILE.UPDATE_NAME, JSON.stringify(name), {
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data;
};

export const updateEmail = async (email) => {
  const response = await apiClient.patch(ENDPOINTS.USER_PROFILE.UPDATE_EMAIL, JSON.stringify(email), {
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data;
};

export const updateLocation = async (locationData) => {
  const response = await apiClient.patch(ENDPOINTS.USER_PROFILE.UPDATE_LOCATION, locationData);
  return response.data;
};

export const logoutUser = async () => {
  const response = await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  return response.data;
};

export const changePassword = async (passwords) => {
  const response = await apiClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, passwords);
  return response.data;
};

// Billing
export const getWalletBalance = async () => {
  const response = await apiClient.get(ENDPOINTS.BILLING.WALLET_BALANCE);
  return response.data;
};

export const submitDepositRequest = async (formData, options = {}) => {
  const response = await apiClient.post(ENDPOINTS.BILLING.DEPOSIT_REQUESTS, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...options
  });
  return response.data;
};

export const getMyDepositRequests = async (page = 1, pageSize = 10) => {
  const response = await apiClient.get(ENDPOINTS.BILLING.MY_DEPOSIT_REQUESTS, {
    params: { page, pageSize }
  });
  return response.data?.data || response.data;
};

export const downloadReceipt = async (requestId) => {
  const response = await apiClient.get(ENDPOINTS.BILLING.DOWNLOAD_RECEIPT.replace('{requestId}', requestId), { responseType: 'blob' });
  return response.data?.data || response.data;
};

export const addPaymentMethod = async (paymentData) => {
  const response = await apiClient.post(ENDPOINTS.USER_PROFILE.PAYMENT_METHOD, paymentData);
  return response.data;
};

export const updatePaymentMethod = async (methodId, paymentData) => {
  const response = await apiClient.patch(`${ENDPOINTS.USER_PROFILE.PAYMENT_METHOD}/${methodId}`, paymentData);
  return response.data;
};

export const deletePaymentMethod = async (methodId) => {
  const response = await apiClient.delete(`${ENDPOINTS.USER_PROFILE.PAYMENT_METHOD}/${methodId}`);
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await apiClient.post(ENDPOINTS.JOBS.CREATE, jobData);
  return response.data;
};

export const getCategories = async (options = {}) => {
  const response = await apiClient.get(ENDPOINTS.CATEGORIES, options);
  return response.data;
};

export const getSkills = async (options = {}) => {
  const response = await apiClient.get(ENDPOINTS.SKILLS.BASE, options);
  return response.data;
};

export const getUserPaymentMethods = async () => {
  const response = await apiClient.get(ENDPOINTS.USER_PROFILE.BASE);
  return response.data?.data?.paymentMethods || [];
};

// Proposals
export const getClientProposals = async () => {
  const response = await apiClient.get(ENDPOINTS.JOBS.CLIENT_PROPOSALS);
  return response.data;
};

// Proposals actions
export const rejectProposal = async (proposalId) => {
  const url = ENDPOINTS.PROPOSALS.REJECT.replace('{id}', proposalId);
  const response = await apiClient.post(url);
  return response.data;
};

export const createOffer = async ({ freelancerId, proposalId, jobPostId, agreedRate, jobDescription }) => {
  const response = await apiClient.post(ENDPOINTS.PROPOSALS.CREATE_OFFER, {
    freelancerId,
    proposalId,
    jobPostId,
    agreedRate,
    jobDescription,
  });
  return response.data;
};

// Job Invitations

export const sendJobInvitation = async ({ jobPostId, freelancerId, message }) => {
  const response = await apiClient.post(ENDPOINTS.JOB_INVITATIONS.BASE, {
    jobPostId,
    freelancerId,
    message,
  });
  return response.data;
};

export const withdrawJobInvitation = async (invitationId) => {
  const response = await apiClient.post(ENDPOINTS.JOB_INVITATIONS.WITHDRAW.replace('{id}', invitationId));
  return response.data;
};

export const getClientInvitations = async (jobPostId = null) => {
  const response = await apiClient.get(ENDPOINTS.JOB_INVITATIONS.CLIENT, {
    params: jobPostId ? { jobPostId } : undefined,
  });
  return response.data;
};

export const getInvitationDetails = async (invitationId) => {
  const response = await apiClient.get(ENDPOINTS.JOB_INVITATIONS.DETAIL.replace('{id}', invitationId));
  return response.data;
};

export const revokeOffer = async (contractId) => {
  const response = await apiClient.post(ENDPOINTS.CONTRACTS.REVOKE_OFFER(contractId));
  return response.data;
};

export const getJobDetails = async (jobId, options = {}) => {
  const url = ENDPOINTS.JOBS.DETAILS.replace('{id}', jobId);
  const response = await apiClient.get(url, options);
  return response.data;
};