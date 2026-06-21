import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

export const getChats = async (options = {}) => {
  const res = await apiClient.get(ENDPOINTS.CHAT.LIST, options);
  return res.data?.data ?? res.data;
};

export const getMessages = async (chatId, page, pageSize, options = {}) => {
  const res = await apiClient.get(ENDPOINTS.CHAT.MESSAGES(chatId), { params: { page, pageSize }, ...options });
  return res.data?.data ?? res.data;
};

export const sendTextMessage = async (chatId, text) => {
  const res = await apiClient.post(ENDPOINTS.CHAT.SEND_TEXT(chatId), { Text: text });
  return res.data?.data ?? res.data;
};

export const sendFileMessage = async (chatId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post(ENDPOINTS.CHAT.SEND_FILE(chatId), formData, {
    headers: { 'Content-Type': undefined }
  });
  return res.data?.data ?? res.data;
};

export const getChatByContract = async (contractId) => {
  const res = await apiClient.get(ENDPOINTS.CHAT.BY_CONTRACT(contractId));
  return res.data?.data ?? res.data;
};
