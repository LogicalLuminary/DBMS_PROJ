import axiosInstance from "./axiosInstance";

const BASE_URL = "/fee-details";

const feeDetailsApi = {
  getAll: async () => {
    const response = await axiosInstance.get(BASE_URL);
    return response.data;
  },

  getById: async (receiptId, description) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/${receiptId}/${encodeURIComponent(description)}`
    );
    return response.data;
  },

  create: async (details) => {
    const response = await axiosInstance.post(BASE_URL, details);
    return response.data;
  },

  update: async (receiptId, description, details) => {
    const response = await axiosInstance.put(
      `${BASE_URL}/${receiptId}/${encodeURIComponent(description)}`,
      details
    );
    return response.data;
  },

  delete: async (receiptId, description) => {
    await axiosInstance.delete(
      `${BASE_URL}/${receiptId}/${encodeURIComponent(description)}`
    );
  },
};

export default feeDetailsApi;