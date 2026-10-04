import axiosInstance from "./axiosInstance";

const BASE_URL = "/course-module";

const courseModuleApi = {
  getAll: async () => {
    const response = await axiosInstance.get(BASE_URL);
    return response.data;
  },

  getById: async (moduleId, courseId) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/${moduleId}/${courseId}`
    );
    return response.data;
  },

  create: async (moduleData) => {
    const response = await axiosInstance.post(BASE_URL, moduleData);
    return response.data;
  },

  update: async (moduleId, courseId, moduleData) => {
    const response = await axiosInstance.put(
      `${BASE_URL}/${moduleId}/${courseId}`,
      moduleData
    );
    return response.data;
  },

  delete: async (moduleId, courseId) => {
    const response = await axiosInstance.delete(
      `${BASE_URL}/${moduleId}/${courseId}`
    );
    return response.data;
  },
};

export default courseModuleApi;