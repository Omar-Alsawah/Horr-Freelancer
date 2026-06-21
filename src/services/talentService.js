import apiClient from "./apiClient";
import { ENDPOINTS } from "./endpoints";

/**
 * talentService.js
 * API calls for freelancer/talent search and management
 */

const unwrapData = (response) => response.data?.data ?? response.data;

/**
 * Search freelancers with optional filters and pagination
 */
export const searchFreelancers = async (params = {}) => {
  const defaults = {
    sortBy: "TrustScore",
    sortDescending: true,
    page: 1,
    pageSize: 10,
  };

  const queryParams = { ...defaults, ...params };

  try {
    const response = await apiClient.get(ENDPOINTS.TALENT.searchFreelancers, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error searching freelancers:", error);
    throw error;
  }
};

/**
 * Get public freelancer profile by hash id
 * @param {string} userIdHash
 */
export const getPublicFreelancerProfile = async (userIdHash) => {
  try {
    const response = await apiClient.get(
      ENDPOINTS.USER_PROFILE.PUBLIC.replace("{userIdHash}", userIdHash)
    );
    return unwrapData(response);
  } catch (error) {
    console.error(`Error fetching public profile ${userIdHash}:`, error);
    throw error;
  }
};

/**
 * Save/bookmark a freelancer
 * @param {string} freelancerId
 */
export const saveFreelancer = async (freelancerId) => {
  try {
    const response = await apiClient.post(
      ENDPOINTS.TALENT.saveFreelancer.replace("{freelancerId}", freelancerId)
    );
    return response.data;
  } catch (error) {
    console.error(`Error saving freelancer ${freelancerId}:`, error);
    throw error;
  }
};

/**
 * Unsave/unbookmark a freelancer
 * @param {string} freelancerId
 */
export const unsaveFreelancer = async (freelancerId) => {
  try {
    const response = await apiClient.delete(
      ENDPOINTS.TALENT.unsaveFreelancer.replace("{freelancerId}", freelancerId)
    );
    return response.data;
  } catch (error) {
    console.error(`Error unsaving freelancer ${freelancerId}:`, error);
    throw error;
  }
};

export const getSavedFreelancers = async (params = {}) => {
  const defaults = {
    page: 1,
    pageSize: 10,
  };

  const queryParams = { ...defaults, ...params };

  try {
    const response = await apiClient.get(ENDPOINTS.TALENT.getSavedFreelancers, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching saved freelancers:", error);
    throw error;
  }
};

export const getRecommendedFreelancers = async (options = {}) => {
  try {
    const response = await apiClient.get(ENDPOINTS.TALENT.recommendedFreelancers, options);
    return response.data;
  } catch (error) {
    console.error("Error fetching recommended freelancers:", error);
    throw error;
  }
};

