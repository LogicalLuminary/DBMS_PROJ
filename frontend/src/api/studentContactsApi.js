import axios from "axios";

const API = "/api/student-contacts";

export const getStudentContacts = async () => {
  const response = await axios.get(API);
  return response.data;
};

export const getStudentContact = async (studentId, phoneNo) => {
  const response = await axios.get(
    `${API}/${studentId}/${encodeURIComponent(phoneNo)}`
  );
  return response.data;
};

export const createStudentContact = async (data) => {
  const response = await axios.post(API, data);
  return response.data;
};

export const updateStudentContact = async (
  studentId,
  phoneNo,
  data
) => {
  const response = await axios.put(
    `${API}/${studentId}/${encodeURIComponent(phoneNo)}`,
    data
  );
  return response.data;
};

export const deleteStudentContact = async (
  studentId,
  phoneNo
) => {
  await axios.delete(
    `${API}/${studentId}/${encodeURIComponent(phoneNo)}`
  );
};