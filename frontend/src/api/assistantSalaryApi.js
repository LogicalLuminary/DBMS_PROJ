import axios from "axios";

const API = "/api/assistant-salary-records";

export const getAssistantSalaries = async () => {
  const response = await axios.get(API);
  return response.data;
};

export const getAssistantSalary = async (receiptId) => {
  const response = await axios.get(`${API}/${receiptId}`);
  return response.data;
};

export const createAssistantSalary = async (salary) => {
  const response = await axios.post(API, salary);
  return response.data;
};

export const updateAssistantSalary = async (receiptId, salary) => {
  const response = await axios.put(`${API}/${receiptId}`, salary);
  return response.data;
};

export const deleteAssistantSalary = async (receiptId) => {
  const response = await axios.delete(`${API}/${receiptId}`);
  return response.data;
};