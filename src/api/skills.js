import { ENDPOINTS } from '@/services/endpoints';
import api from './axios';

export const skillsApi = {
  getAllSkills: () => api.get(ENDPOINTS.SKILLS.BASE),
  getMySkills: () => api.get(ENDPOINTS.SKILLS.MY_SKILLS),
  addSkill: (data) => api.post(ENDPOINTS.SKILLS.MY_SKILLS, data),
  removeSkill: (skillId) => api.delete(ENDPOINTS.SKILLS.MY_SKILL_ID(skillId))
};
