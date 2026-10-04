import axios from "axios";

const API = "/api/assistant-salary-details";

export const getAssistantSalaryDetails = async () => {
  const response = await axios.get(API);
  return response.data;
};

export const createAssistantSalaryDetail = async (detail) => {
  const response = await axios.post(API, detail);
  return response.data;
};

export const updateAssistantSalaryDetail = async (
  receiptId,
  description,
  detail
) => {
  const response = await axios.put(
    `${API}/${receiptId}/${encodeURIComponent(description)}`,
    detail
  );
  return response.data;
};

export const deleteAssistantSalaryDetail = async (
  receiptId,
  description
) => {
  const response = await axios.delete(
    `${API}/${receiptId}/${encodeURIComponent(description)}`
  );
  return response.data;
};