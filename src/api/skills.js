import { ENDPOINTS } from '@/services/endpoints';
import api from './axios';

export const skillsApi = {
  getAllSkills: (options = {}) => api.get(ENDPOINTS.SKILLS.BASE, options),
  getMySkills: (options = {}) => api.get(ENDPOINTS.SKILLS.MY_SKILLS, options),
  addSkill: (data) => api.post(ENDPOINTS.SKILLS.MY_SKILLS, data),
  removeSkill: (skillId) => api.delete(ENDPOINTS.SKILLS.MY_SKILL_ID(skillId))
};
