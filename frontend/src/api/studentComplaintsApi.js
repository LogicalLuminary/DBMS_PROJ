import axios from "axios";

const API_URL = "http://localhost:8080/api/student-complaints";

export const getStudentComplaints = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createStudentComplaint = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateStudentComplaint = async (
  complaintId,
  studentId,
  data
) => {
  const response = await axios.put(
    `${API_URL}/${complaintId}/${studentId}`,
    data
  );
  return response.data;
};

export const deleteStudentComplaint = async (
  complaintId,
  studentId
) => {
  await axios.delete(`${API_URL}/${complaintId}/${studentId}`);
};