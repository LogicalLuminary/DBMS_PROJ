import axiosInstance from "./axiosInstance";

const BASE_URL = "/enrollment";

const enrollmentApi = {
  getAll: async () => {
    const response = await axiosInstance.get(BASE_URL);
    return response.data;
  },

  getById: async (studentId, batchId) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/${studentId}/${batchId}`
    );
    return response.data;
  },

  create: async (enrollment) => {
    const response = await axiosInstance.post(BASE_URL, enrollment);
    return response.data;
  },

  update: async (studentId, batchId, enrollment) => {
    const response = await axiosInstance.put(
      `${BASE_URL}/${studentId}/${batchId}`,
      enrollment
    );
    return response.data;
  },

  delete: async (studentId, batchId) => {
    const response = await axiosInstance.delete(
      `${BASE_URL}/${studentId}/${batchId}`
    );
    return response.data;
  },
};

export default enrollmentApi;