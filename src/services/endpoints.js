export const ENDPOINTS = {
  USER: {
    PROFILE: '/user/profile',
  },
  CLIENT: {
    ME: '/client/me',
    ONBOARDING: '/client/onboarding',
    JOBS: '/client/jobs',
  },
  USER_PROFILE: {
    BASE: '/UserProfile',
    UPDATE_NAME: '/UserProfile/name',
    UPDATE_EMAIL: '/UserProfile/email',
    UPDATE_LOCATION: '/UserProfile/location',
    PAYMENT_METHOD: '/UserProfile/payment-method',
    PUBLIC: '/UserProfile/public/{userIdHash}',
  },
  BILLING: {
    WALLET_BALANCE: '/Billing/wallet-balance',
    DEPOSIT_REQUESTS: '/Billing/deposit-requests',
    MY_DEPOSIT_REQUESTS: '/Billing/deposit-requests/my-requests',
    DOWNLOAD_RECEIPT: (requestId) => `/Billing/deposit-requests/${requestId}/receipt`,
  },
  AUTH: {
    LOGIN: '/Auth/login',
    REGISTER: '/Auth/register',
    CHANGE_PASSWORD: '/Auth/change-password',
    REFRESH_TOKEN: '/Auth/refresh-token',
    LOGOUT: '/Auth/logout',
  },
  JOBS: {
    CREATE: '/Jobs/create-job',
    LIST: '/Jobs/jobs',
    UPDATE: '/Jobs/update-job',
    DELETE: '/Jobs/delete-job',
    CLIENT_PROPOSALS: '/client/proposals',
    DETAILS: '/Jobs/jobs/{id}',
  },

  CATEGORIES: '/Categories',
  SKILLS: '/Skills',

  CONVERSATIONS: {
    SEND_MESSAGE: '/chat/{conversationId}/messages/text',
  },

  TALENT: {
    searchFreelancers: '/client/freelancers/search',
    saveFreelancer: '/client/freelancers/{freelancerId}/save',
    unsaveFreelancer: '/client/freelancers/{freelancerId}/unsave',
    getSavedFreelancers: '/client/freelancers/saved',
    recommendedFreelancers: '/Recommendations/freelancers',
  },

  PROPOSALS: {
    REJECT: '/Proposals/{id}/reject',
    CREATE_OFFER: '/Contracts/create-offer',
  },

  JOB_INVITATIONS: {
    BASE: '/jobinvitations',
    WITHDRAW: '/jobinvitations/{id}/withdraw',
    ACCEPT: '/jobinvitations/{id}/accept',
    DECLINE: '/jobinvitations/{id}/decline',
    DETAIL: '/jobinvitations/{id}',
    CLIENT: '/jobinvitations/client',
    FREELANCER: '/jobinvitations/freelancer',
  },
  CONTRACTS: {
    MY_CONTRACTS: '/contracts/my-contracts',
    GET_CONTRACT: (id) => `/contracts/${id}`,
    SUBMIT_REVIEW: (id) => `/contracts/${id}/reviews`,
    REVOKE_OFFER: (id) => `/contracts/${id}/revoke-offer`,
  },
  DELIVERIES: {
    GET_BY_CONTRACT: '/deliveries',
    APPROVE: (id) => `/deliveries/${id}/approve`,
    REVISION: (id) => `/deliveries/${id}/revision`,
    SUBMIT_SPECIALIST_REVIEW: (contractId, deliveryId) => `/contracts/${contractId}/deliveries/${deliveryId}/specialist-review`,
    DISPUTE: (id) => `/deliveries/${id}/dispute`,
    DOWNLOAD: (id) => `/deliveries/attachments/${id}/download`,
  },
  REVISIONS: {
    REQUEST_ADDITIONAL: '/revisions/additional/request',
  },
  CHAT: {
    LIST: '/chat',
    MESSAGES: (chatId) => `/chat/${chatId}/messages`,
    SEND_TEXT: (chatId) => `/chat/${chatId}/messages/text`,
    SEND_FILE: (chatId) => `/chat/${chatId}/messages/file`,
    BY_CONTRACT: (contractId) => `/chat/by-contract/${contractId}`,
  }
};
