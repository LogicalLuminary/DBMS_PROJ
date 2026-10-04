import axiosInstance from "./axiosInstance";

const BASE_URL = "/student";

const studentApi = {
  getAll: async () => {
    const response = await axiosInstance.get(BASE_URL);
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  create: async (student) => {
    const response = await axiosInstance.post(BASE_URL, student);
    return response.data;
  },

  update: async (id, student) => {
    const response = await axiosInstance.put(
      `${BASE_URL}/${id}`,
      student
    );
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
};

export default studentApi;