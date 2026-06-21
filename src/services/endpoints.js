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
    BASE: '/UserProfile', // Fallback for old references
    UPDATE_NAME: '/UserProfile/name',
    UPDATE_EMAIL: '/UserProfile/email',
    UPDATE_LOCATION: '/UserProfile/location',
    PAYMENT_METHOD: '/UserProfile/payment-method',
    PUBLIC: '/UserProfile/public/{userIdHash}',
    // New ones:
    BIO: '/api/UserProfile/bio',
    EMAIL: '/api/UserProfile/email',
    EXPERIENCE_LEVEL: '/api/UserProfile/experience-level',
    FREELANCER_DETAILS: '/api/UserProfile/freelancer-details',
    LOCATION: '/api/UserProfile/location',
    NAME: '/api/UserProfile/name',
    PREFERRED_CURRENCY: '/api/UserProfile/preferred-currency',
    PRIVACY: '/api/UserProfile/privacy',
    TITLE: '/api/UserProfile/title',
    PUBLIC_FN: (userIdHash) => `/api/UserProfile/public/${userIdHash}`,
  },
  BILLING: {
    WALLET_BALANCE: '/Billing/wallet-balance',
    DEPOSIT_REQUESTS: '/Billing/deposit-requests',
    MY_DEPOSIT_REQUESTS: '/Billing/deposit-requests/my-requests',
    DOWNLOAD_RECEIPT: (requestId) => `/Billing/deposit-requests/${requestId}/receipt`,
    // New ones:
    WITHDRAWAL_REQUESTS: '/api/Billing/withdrawal-requests',
    MY_WITHDRAWAL_REQUESTS: '/api/Billing/withdrawal-requests/my-requests',
  },
  ADMIN: {
    DEPOSIT_PENDING: '/api/admin/billing/deposit-requests/pending',
    DEPOSIT_REVIEW: (id) => `/api/admin/billing/deposit-requests/${id}/review`,
    WITHDRAWAL_PENDING: '/api/admin/billing/withdrawal-requests/pending',
    WITHDRAWAL_REVIEW: (id) => `/api/admin/billing/withdrawal-requests/${id}/review`,
  },
  AUTH: {
    LOGIN: '/Auth/login',
    REGISTER: '/Auth/register',
    CHANGE_PASSWORD: '/Auth/change-password',
    REFRESH_TOKEN: '/Auth/refresh-token',
    LOGOUT: '/Auth/logout',
    // New ones:
    RESEND_CONFIRMATION_EMAIL: '/api/Auth/resend-confirmation-email',
    CONFIRM_EMAIL: '/api/Auth/confirm-email',
    CLOSE_ACCOUNT: '/api/Auth/close-account',
  },
  JOBS: {
    CREATE: '/Jobs/create-job',
    LIST: '/Jobs/jobs',
    UPDATE: '/Jobs/update-job',
    DELETE: '/Jobs/delete-job',
    CLIENT_PROPOSALS: '/client/proposals',
    DETAILS: '/Jobs/jobs/{id}',
    // New ones:
    DETAILS_FN: (id) => `/api/jobs/jobs/${id}`,
    SAVE: (id) => `/api/jobs/${id}/save-job`,
    UNSAVE: (id) => `/api/jobs/${id}/unsave-job`,
    SAVED: '/api/jobs/saved',
    RECOMMENDED: '/api/Recommendations/jobs',
  },

  CATEGORIES: '/Categories',
  SKILLS: {
    BASE: '/api/Skills',
    MY_SKILLS: '/api/Skills/my-skills',
    MY_SKILL_ID: (skillId) => `/api/Skills/my-skills/${skillId}`,
    OLD: '/Skills' // Retain old string property
  },

  PORTFOLIO: {
    BASE: '/api/Portfolio',
    BY_ID: (id) => `/api/Portfolio/${id}`,
  },
  SERVICES: {
    BASE: '/api/services',
    BY_ID: (id) => `/api/services/${id}`,
    MY_SERVICES: '/api/services/my-services',
  },

  CONVERSATIONS: {
    SEND_MESSAGE: '/chat/{conversationId}/messages/text',
  },

  TALENT: {
    searchFreelancers: '/client/freelancers/search',
    saveFreelancer: '/client/freelancers/{freelancerId}/save',
    unsaveFreelancer: '/client/freelancers/{freelancerId}/unsave',
    getSavedFreelancers: '/client/freelancers/saved',
    recommendedFreelancers: '/Recommendations/freelancers',
    // New ones:
    SEARCH: '/api/client/freelancers/search',
    SAVE: (freelancerId) => `/api/client/freelancers/${freelancerId}/save`,
    UNSAVE: (freelancerId) => `/api/client/freelancers/${freelancerId}/unsave`,
    SAVED: '/api/client/freelancers/saved',
    RECOMMENDED: '/api/Recommendations/freelancers',
  },

  PROPOSALS: {
    REJECT: '/Proposals/{id}/reject',
    CREATE_OFFER: '/Contracts/create-offer',
    // New ones:
    BASE: '/api/proposals',
    BY_ID: (id) => `/api/proposals/${id}`,
    WITHDRAW: (id) => `/api/proposals/${id}/withdraw`,
    MY_PROPOSALS: '/api/proposals/my-proposals',
  },

  JOB_INVITATIONS: {
    BASE: '/jobinvitations',
    WITHDRAW: '/jobinvitations/{id}/withdraw',
    ACCEPT: '/jobinvitations/{id}/accept',
    DECLINE: '/jobinvitations/{id}/decline',
    DETAIL: '/jobinvitations/{id}',
    CLIENT: '/jobinvitations/client',
    FREELANCER: '/jobinvitations/freelancer',
    // New ones (override with functions where needed, but keeping string versions):
    WITHDRAW_FN: (id) => `/api/jobinvitations/${id}/withdraw`,
    ACCEPT_FN: (id) => `/api/jobinvitations/${id}/accept`,
    DECLINE_FN: (id) => `/api/jobinvitations/${id}/decline`,
    DETAIL_FN: (id) => `/api/jobinvitations/${id}`,
  },
  CONTRACTS: {
    MY_CONTRACTS: '/contracts/my-contracts',
    GET_CONTRACT: (id) => `/contracts/${id}`,
    SUBMIT_REVIEW: (id) => `/contracts/${id}/reviews`,
    REVOKE_OFFER: (id) => `/contracts/${id}/revoke-offer`,
    // New ones:
    ACCEPT_OFFER: (contractId) => `/api/contracts/${contractId}/accept-offer`,
    DECLINE_OFFER: (contractId) => `/api/contracts/${contractId}/decline-offer`,
    DELIVER_WORK: (id) => `/api/contracts/${id}/deliver-work`,
    COMPLETE: (contractId) => `/api/contracts/${contractId}/complete`,
    ESCROW: (contractId) => `/api/contracts/${contractId}/escrow`,
  },
  DELIVERIES: {
    GET_BY_CONTRACT: '/deliveries',
    APPROVE: (id) => `/deliveries/${id}/approve`,
    REVISION: (id) => `/deliveries/${id}/revision`,
    SUBMIT_SPECIALIST_REVIEW: (contractId, deliveryId) => `/contracts/${contractId}/deliveries/${deliveryId}/specialist-review`,
    DISPUTE: (id) => `/deliveries/${id}/dispute`,
    DOWNLOAD: (id) => `/deliveries/attachments/${id}/download`,
    // New ones:
    BASE: '/api/deliveries',
    BY_ID: (deliveryId) => `/api/deliveries/${deliveryId}`,
    SUBMIT: '/api/deliveries/submit',
    UPLOAD: '/api/deliveries/upload',
  },
  DISPUTES: {
    BASE: '/api/disputes',
    ADMIN_LIST: '/api/disputes?status=Open&status=UnderReview',
    RESOLVE: (disputeId) => `/api/disputes/${disputeId}/resolve`,
  },
  MILESTONES: {
    FUND: (milestoneId) => `/api/milestones/${milestoneId}/fund`,
  },
  REVISIONS: {
    REQUEST_ADDITIONAL: '/revisions/additional/request',
    // New ones:
    ACCEPT: (revisionId) => `/api/revisions/${revisionId}/accept`,
    RESPOND: (requestId) => `/api/revisions/additional/${requestId}/respond`,
    PENDING: '/api/revisions/additional/pending',
    FREELANCER: '/api/revisions/freelancer',
    MY_CASES: '/api/revisions/my-cases',
    OPEN: '/api/revisions/open',
    SPECIALIST_QUEUE: '/api/revisions/specialist-queue',
  },
  VERIFICATION: {
    ALL: '/api/Verification/all',
    PENDING: '/api/Verification/pending',
    REVIEW: '/api/Verification/review',
    MY_STATUS: '/api/verification/my-status',
    SUBMIT: '/api/verification/submit',
  },
  WALLET: {
    BALANCE: '/api/wallet/balance',
  },
  CHAT: {
    LIST: '/chat',
    MESSAGES: (chatId) => `/chat/${chatId}/messages`,
    SEND_TEXT: (chatId) => `/chat/${chatId}/messages/text`,
    SEND_FILE: (chatId) => `/chat/${chatId}/messages/file`,
    BY_CONTRACT: (contractId) => `/chat/by-contract/${contractId}`,
    // New ones:
    INITIATE: '/api/chat/initiate',
  }
};
