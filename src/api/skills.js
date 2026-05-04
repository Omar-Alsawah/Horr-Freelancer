import api from './axios';

export const skillsApi = {
  getAllSkills: () => api.get('/api/skills'),
  getMySkills: () => api.get('/api/skills/my-skills'),
  addSkill: (data) => api.post('/api/skills/my-skills', data),
  removeSkill: (skillId) => api.delete(`/api/skills/my-skills/${skillId}`)
};
