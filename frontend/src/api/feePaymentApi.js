import axiosInstance from "./axiosInstance";

const BASE_URL = "/fee-payment";

const feePaymentApi = {
  getAll: async () => {
    const response = await axiosInstance.get(BASE_URL);
    return response.data;
  },

  getById: async (receiptId) => {
    const response = await axiosInstance.get(`${BASE_URL}/${receiptId}`);
    return response.data;
  },

  create: async (payment) => {
    const response = await axiosInstance.post(BASE_URL, payment);
    return response.data;
  },

  update: async (receiptId, payment) => {
    const response = await axiosInstance.put(
      `${BASE_URL}/${receiptId}`,
      payment
    );
    return response.data;
  },

  delete: async (receiptId) => {
    await axiosInstance.delete(`${BASE_URL}/${receiptId}`);
  },
};

export default feePaymentApi;