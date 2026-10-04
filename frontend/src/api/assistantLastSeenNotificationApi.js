import axios from "axios";

const API_URL =
  "http://localhost:8080/api/assistant-lastseen-notification";

export const getAssistantLastSeenNotifications = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getAssistantLastSeenNotification = async (
  assistantId
) => {
  const response = await axios.get(`${API_URL}/${assistantId}`);
  return response.data;
};

export const createAssistantLastSeenNotification = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateAssistantLastSeenNotification = async (
  assistantId,
  data
) => {
  const response = await axios.put(
    `${API_URL}/${assistantId}`,
    data
  );
  return response.data;
};

export const deleteAssistantLastSeenNotification = async (
  assistantId
) => {
  await axios.delete(`${API_URL}/${assistantId}`);
};