import axios from "axios";

const API_URL = "http://localhost:8080/api/globalnotification";

export const getGlobalNotifications = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getGlobalNotification = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createGlobalNotification = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateGlobalNotification = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteGlobalNotification = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
};