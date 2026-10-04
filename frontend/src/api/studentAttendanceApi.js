import axiosInstance from "./axiosInstance";

const BASE_URL = "/student-attendance";

const studentAttendanceApi = {
  getAll: async () => {
    const response = await axiosInstance.get(BASE_URL);
    return response.data;
  },

  getById: async (date, studentId, batchId) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/${date}/${studentId}/${batchId}`
    );
    return response.data;
  },

  create: async (attendance) => {
    const response = await axiosInstance.post(BASE_URL, attendance);
    return response.data;
  },

  update: async (date, studentId, batchId, attendance) => {
    const response = await axiosInstance.put(
      `${BASE_URL}/${date}/${studentId}/${batchId}`,
      attendance
    );
    return response.data;
  },

  delete: async (date, studentId, batchId) => {
    await axiosInstance.delete(
      `${BASE_URL}/${date}/${studentId}/${batchId}`
    );
  },
};

export default studentAttendanceApi;