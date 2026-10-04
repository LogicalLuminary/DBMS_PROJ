import axiosInstance from "./axiosInstance";

const BASE_URL = "/takes";

const takesApi = {
  getAll: async () => {
    const response = await axiosInstance.get(BASE_URL);
    return response.data;
  },

  getById: async (studentId, batchId, testId) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/${studentId}/${batchId}/${testId}`
    );
    return response.data;
  },

  create: async (result) => {
    const response = await axiosInstance.post(BASE_URL, result);
    return response.data;
  },

  update: async (studentId, batchId, testId, result) => {
    const response = await axiosInstance.put(
      `${BASE_URL}/${studentId}/${batchId}/${testId}`,
      result
    );
    return response.data;
  },

  delete: async (studentId, batchId, testId) => {
    await axiosInstance.delete(
      `${BASE_URL}/${studentId}/${batchId}/${testId}`
    );
  },
};

export default takesApi;