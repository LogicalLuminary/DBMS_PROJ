import axios from "axios";

const API_URL = "http://localhost:8080/api/teacher-complaints";

export const getTeacherComplaints = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createTeacherComplaint = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateTeacherComplaint = async (
  complaintId,
  teacherId,
  data
) => {
  const response = await axios.put(
    `${API_URL}/${complaintId}/${teacherId}`,
    data
  );
  return response.data;
};

export const deleteTeacherComplaint = async (
  complaintId,
  teacherId
) => {
  await axios.delete(`${API_URL}/${complaintId}/${teacherId}`);
};