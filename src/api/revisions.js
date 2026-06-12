import api from './axios';

export const revisionsApi = {
  getOpenRevisions: () => api.get('/api/revisions/open'),
  getMyCases: () => api.get('/api/revisions/my-cases'),
  acceptRevision: (revisionId) => api.post(`/api/revisions/${revisionId}/accept`)
};
