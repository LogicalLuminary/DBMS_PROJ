import axiosInstance from "./axiosInstance";

const BASE_URL = "/batch";

const batchApi = {
  getAll: async () => {
    const response = await axiosInstance.get(BASE_URL);
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  create: async (batch) => {
    const response = await axiosInstance.post(BASE_URL, batch);
    return response.data;
  },

  update: async (id, batch) => {
    const response = await axiosInstance.put(`${BASE_URL}/${id}`, batch);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
};

export default batchApi;