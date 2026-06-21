import { ENDPOINTS } from '@/services/endpoints';
import apiClient from './axios';

// ─── Get all chats for the authenticated user ───────────────────────────────
export async function getChats() {
  const response = await apiClient.get(ENDPOINTS.CHAT.LIST);
  return response.data;
}

// ─── Get paginated messages for a chat ──────────────────────────────────────
export async function getMessages(chatId, page = 1, pageSize = 30) {
  const response = await apiClient.get(ENDPOINTS.CHAT.MESSAGES(chatId), {
    params: { page, pageSize },
  });
  return response.data;
}

// ─── Send a text message ────────────────────────────────────────────────────
export async function sendTextMessage(chatId, text) {
  const response = await apiClient.post(
    ENDPOINTS.CHAT.SEND_TEXT(chatId),
    { Text: text } // Using "Text" (PascalCase) to match the SendTextMessageRequest DTO from the API contract
  );
  return response.data;
}

// ─── Upload a file message ──────────────────────────────────────────────────
// ⚠️ Uses apiClient
// ⚠️ Do NOT set Content-Type — browser sets multipart boundary automatically
export async function uploadFile(chatId, file) {
  const formData = new FormData();
  formData.append('file', file); // "file" must match exact field name from API contracts doc
  const response = await apiClient.post(
    ENDPOINTS.CHAT.SEND_FILE(chatId),
    formData
  );
  return response.data;
}

// ─── Get or create chat by contract ID ──────────────────────────────────────
export async function getChatByContract(contractId) {
  const response = await apiClient.get(ENDPOINTS.CHAT.BY_CONTRACT(contractId));
  return response.data;
}

// ─── Initiate a chat for a contract ─────────────────────────────────────────
// POST /api/chat/initiate with { contractId } in the request body
export async function initiateChat(contractId) {
  const response = await apiClient.post(ENDPOINTS.CHAT.INITIATE, { contractId });
  return response.data;
}
