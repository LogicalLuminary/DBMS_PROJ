import axios from "axios";

const API_URL = "http://localhost:8080/api/batch-notification";

export const getBatchNotifications = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getBatchNotification = async (
  notificationId,
  batchId
) => {
  const response = await axios.get(
    `${API_URL}/${notificationId}/${batchId}`
  );
  return response.data;
};

export const createBatchNotification = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateBatchNotification = async (
  notificationId,
  batchId,
  data
) => {
  const response = await axios.put(
    `${API_URL}/${notificationId}/${batchId}`,
    data
  );
  return response.data;
};

export const deleteBatchNotification = async (
  notificationId,
  batchId
) => {
  await axios.delete(
    `${API_URL}/${notificationId}/${batchId}`
  );
};