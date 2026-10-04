import axios from "axios";

const API = "/api/assistant-contacts";

export const getAssistantContacts = async () => {
  const response = await axios.get(API);
  return response.data;
};

export const getAssistantContact = async (
  assistantId,
  phoneNo
) => {
  const response = await axios.get(
    `${API}/${assistantId}/${encodeURIComponent(phoneNo)}`
  );
  return response.data;
};

export const createAssistantContact = async (data) => {
  const response = await axios.post(API, data);
  return response.data;
};

export const updateAssistantContact = async (
  assistantId,
  phoneNo,
  data
) => {
  const response = await axios.put(
    `${API}/${assistantId}/${encodeURIComponent(phoneNo)}`,
    data
  );
  return response.data;
};

export const deleteAssistantContact = async (
  assistantId,
  phoneNo
) => {
  await axios.delete(
    `${API}/${assistantId}/${encodeURIComponent(phoneNo)}`
  );
};