import axiosInstance from "./axiosInstance";

const BASE_URL = "/schedule";

const scheduleApi = {
  getAll: async () => {
    const response = await axiosInstance.get(BASE_URL);
    return response.data;
  },

  getById: async (day, batchId) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/${encodeURIComponent(day)}/${batchId}`
    );
    return response.data;
  },

  create: async (schedule) => {
    const response = await axiosInstance.post(BASE_URL, schedule);
    return response.data;
  },

  update: async (day, batchId, schedule) => {
    const response = await axiosInstance.put(
      `${BASE_URL}/${encodeURIComponent(day)}/${batchId}`,
      schedule
    );
    return response.data;
  },

  delete: async (day, batchId) => {
    const response = await axiosInstance.delete(
      `${BASE_URL}/${encodeURIComponent(day)}/${batchId}`
    );
    return response.data;
  },
};

export default scheduleApi;