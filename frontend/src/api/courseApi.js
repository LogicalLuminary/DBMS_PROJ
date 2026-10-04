import axiosInstance from "./axiosInstance";

const courseApi = {
  getAll: async () => {
    const response = await axiosInstance.get("/course");
    return response.data;
  },

  getById: async (courseId) => {
    const response = await axiosInstance.get(`/course/${courseId}`);
    return response.data;
  },

  create: async (course) => {
    const response = await axiosInstance.post("/course", course);
    return response.data;
  },

  update: async (courseId, course) => {
    const response = await axiosInstance.put(
      `/course/${courseId}`,
      course
    );
    return response.data;
  },

  delete: async (courseId) => {
    const response = await axiosInstance.delete(`/course/${courseId}`);
    return response.data;
  },
};

export default courseApi;