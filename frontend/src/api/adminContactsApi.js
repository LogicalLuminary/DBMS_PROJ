import axios from "axios";

const API = "/api/admin-contacts";

export const getAdminContacts = async () => {
  const response = await axios.get(API);
  return response.data;
};

export const getAdminContact = async (adminId, phoneNo) => {
  const response = await axios.get(
    `${API}/${adminId}/${encodeURIComponent(phoneNo)}`
  );
  return response.data;
};

export const createAdminContact = async (data) => {
  const response = await axios.post(API, data);
  return response.data;
};

export const updateAdminContact = async (
  adminId,
  phoneNo,
  data
) => {
  const response = await axios.put(
    `${API}/${adminId}/${encodeURIComponent(phoneNo)}`,
    data
  );
  return response.data;
};

export const deleteAdminContact = async (
  adminId,
  phoneNo
) => {
  await axios.delete(
    `${API}/${adminId}/${encodeURIComponent(phoneNo)}`
  );
};