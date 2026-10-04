import axios from "axios";

const API = "/api/teacher-contacts";

export const getTeacherContacts = async () => {
  const response = await axios.get(API);
  return response.data;
};

export const getTeacherContact = async (teacherId, phoneNo) => {
  const response = await axios.get(
    `${API}/${teacherId}/${encodeURIComponent(phoneNo)}`
  );
  return response.data;
};

export const createTeacherContact = async (data) => {
  const response = await axios.post(API, data);
  return response.data;
};

export const updateTeacherContact = async (
  teacherId,
  phoneNo,
  data
) => {
  const response = await axios.put(
    `${API}/${teacherId}/${encodeURIComponent(phoneNo)}`,
    data
  );
  return response.data;
};

export const deleteTeacherContact = async (
  teacherId,
  phoneNo
) => {
  await axios.delete(
    `${API}/${teacherId}/${encodeURIComponent(phoneNo)}`
  );
};