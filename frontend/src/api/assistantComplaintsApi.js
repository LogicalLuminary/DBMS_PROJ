import axios from "axios";

const API_URL = "http://localhost:8080/api/assistant-complaints";

export const getAssistantComplaints = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createAssistantComplaint = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateAssistantComplaint = async (
  complaintId,
  assistantId,
  data
) => {
  const response = await axios.put(
    `${API_URL}/${complaintId}/${assistantId}`,
    data
  );
  return response.data;
};

export const deleteAssistantComplaint = async (
  complaintId,
  assistantId
) => {
  await axios.delete(`${API_URL}/${complaintId}/${assistantId}`);
};