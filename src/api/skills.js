import api from './axios';

export const skillsApi = {
  getAllSkills: () => api.get('/api/Skills'),
  getMySkills: () => api.get('/api/Skills/my-skills'),
  addSkill: (data) => api.post('/api/Skills/my-skills', data),
  removeSkill: (skillId) => api.delete(`/api/Skills/my-skills/${skillId}`)
};
