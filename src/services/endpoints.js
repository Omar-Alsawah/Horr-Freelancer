export const ENDPOINTS = {
  USER: {
    PROFILE: '/api/user/profile',
  },
  CLIENT: {
    ME: '/api/client/me',
    ONBOARDING: '/api/client/onboarding',
    JOBS: '/api/client/jobs',
  },
  USER_PROFILE: {
    BASE: '/api/UserProfile', // Fallback for old references
    UPDATE_NAME: '/api/UserProfile/name',
    UPDATE_EMAIL: '/api/UserProfile/email',
    UPDATE_LOCATION: '/api/UserProfile/location',
    PAYMENT_METHOD: '/api/UserProfile/payment-method',
    PUBLIC: '/api/UserProfile/public/{userIdHash}',
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
    WALLET_BALANCE: '/api/Billing/wallet-balance',
    DEPOSIT_REQUESTS: '/api/Billing/deposit-requests',
    MY_DEPOSIT_REQUESTS: '/api/Billing/deposit-requests/my-requests',
    DOWNLOAD_RECEIPT: (requestId) => `/api/Billing/deposit-requests/${requestId}/receipt`,
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
    LOGIN: '/api/Auth/login',
    REGISTER: '/api/Auth/register',
    CHANGE_PASSWORD: '/api/Auth/change-password',
    REFRESH_TOKEN: '/api/Auth/refresh-token',
    LOGOUT: '/api/Auth/logout',
    // New ones:
    RESEND_CONFIRMATION_EMAIL: '/api/Auth/resend-confirmation-email',
    CONFIRM_EMAIL: '/api/Auth/confirm-email',
    CLOSE_ACCOUNT: '/api/Auth/close-account',
  },
  JOBS: {
    CREATE: '/api/Jobs/create-job',
    LIST: '/api/Jobs/jobs',
    UPDATE: '/api/Jobs/update-job',
    DELETE: '/api/Jobs/delete-job',
    CLIENT_PROPOSALS: '/api/client/proposals',
    DETAILS: '/api/Jobs/jobs/{id}',
    // New ones:
    DETAILS_FN: (id) => `/api/jobs/jobs/${id}`,
    SAVE: (id) => `/api/jobs/${id}/save-job`,
    UNSAVE: (id) => `/api/jobs/${id}/unsave-job`,
    SAVED: '/api/jobs/saved',
    RECOMMENDED: '/api/Recommendations/jobs',
  },

  CATEGORIES: '/api/Categories',
  SKILLS: {
    BASE: '/api/Skills',
    MY_SKILLS: '/api/Skills/my-skills',
    MY_SKILL_ID: (skillId) => `/api/Skills/my-skills/${skillId}`,
    OLD: '/api/Skills' // Retain old string property
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
    SEND_MESSAGE: '/api/chat/{conversationId}/messages/text',
  },

  TALENT: {
    searchFreelancers: '/api/client/freelancers/search',
    saveFreelancer: '/api/client/freelancers/{freelancerId}/save',
    unsaveFreelancer: '/api/client/freelancers/{freelancerId}/unsave',
    getSavedFreelancers: '/api/client/freelancers/saved',
    recommendedFreelancers: '/api/Recommendations/freelancers',
    // New ones:
    SEARCH: '/api/client/freelancers/search',
    SAVE: (freelancerId) => `/api/client/freelancers/${freelancerId}/save`,
    UNSAVE: (freelancerId) => `/api/client/freelancers/${freelancerId}/unsave`,
    SAVED: '/api/client/freelancers/saved',
    RECOMMENDED: '/api/Recommendations/freelancers',
  },

  PROPOSALS: {
    REJECT: '/api/Proposals/{id}/reject',
    CREATE_OFFER: '/api/Contracts/create-offer',
    // New ones:
    BASE: '/api/proposals',
    BY_ID: (id) => `/api/proposals/${id}`,
    WITHDRAW: (id) => `/api/proposals/${id}/withdraw`,
    MY_PROPOSALS: '/api/proposals/my-proposals',
  },

  JOB_INVITATIONS: {
    BASE: '/api/jobinvitations',
    WITHDRAW: '/api/jobinvitations/{id}/withdraw',
    ACCEPT: '/api/jobinvitations/{id}/accept',
    DECLINE: '/api/jobinvitations/{id}/decline',
    DETAIL: '/api/jobinvitations/{id}',
    CLIENT: '/api/jobinvitations/client',
    FREELANCER: '/api/jobinvitations/freelancer',
    // New ones (override with functions where needed, but keeping string versions):
    WITHDRAW_FN: (id) => `/api/jobinvitations/${id}/withdraw`,
    ACCEPT_FN: (id) => `/api/jobinvitations/${id}/accept`,
    DECLINE_FN: (id) => `/api/jobinvitations/${id}/decline`,
    DETAIL_FN: (id) => `/api/jobinvitations/${id}`,
  },
  CONTRACTS: {
    MY_CONTRACTS: '/api/contracts/my-contracts',
    GET_CONTRACT: (id) => `/api/contracts/${id}`,
    SUBMIT_REVIEW: (id) => `/api/contracts/${id}/reviews`,
    REVOKE_OFFER: (id) => `/api/contracts/${id}/revoke-offer`,
    // New ones:
    ACCEPT_OFFER: (contractId) => `/api/contracts/${contractId}/accept-offer`,
    DECLINE_OFFER: (contractId) => `/api/contracts/${contractId}/decline-offer`,
    DELIVER_WORK: (id) => `/api/contracts/${id}/deliver-work`,
    COMPLETE: (contractId) => `/api/contracts/${contractId}/complete`,
    ESCROW: (contractId) => `/api/contracts/${contractId}/escrow`,
  },
  DELIVERIES: {
    GET_BY_CONTRACT: '/api/deliveries',
    APPROVE: (id) => `/api/deliveries/${id}/approve`,
    REVISION: (id) => `/api/deliveries/${id}/revision`,
    SUBMIT_SPECIALIST_REVIEW: (contractId, deliveryId) => `/api/contracts/${contractId}/deliveries/${deliveryId}/specialist-review`,
    DISPUTE: (id) => `/api/deliveries/${id}/dispute`,
    DOWNLOAD: (id) => `/api/deliveries/attachments/${id}/download`,
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
    REQUEST_ADDITIONAL: '/api/revisions/additional/request',
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
    LIST: '/api/chat',
    MESSAGES: (chatId) => `/api/chat/${chatId}/messages`,
    SEND_TEXT: (chatId) => `/api/chat/${chatId}/messages/text`,
    SEND_FILE: (chatId) => `/api/chat/${chatId}/messages/file`,
    BY_CONTRACT: (contractId) => `/api/chat/by-contract/${contractId}`,
    // New ones:
    INITIATE: '/api/chat/initiate',
  }
};
