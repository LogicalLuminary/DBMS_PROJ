import axiosInstance from "./axiosInstance";

const BASE_URL = "/test";

const testApi = {
  getAll: async () => {
    const response = await axiosInstance.get(BASE_URL);
    return response.data;
  },

  getById: async (testId, batchId) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/${testId}/${batchId}`
    );
    return response.data;
  },

  create: async (test) => {
    const response = await axiosInstance.post(BASE_URL, test);
    return response.data;
  },

  update: async (testId, batchId, test) => {
    const response = await axiosInstance.put(
      `${BASE_URL}/${testId}/${batchId}`,
      test
    );
    return response.data;
  },

  delete: async (testId, batchId) => {
    await axiosInstance.delete(
      `${BASE_URL}/${testId}/${batchId}`
    );
  },
};

export default testApi;