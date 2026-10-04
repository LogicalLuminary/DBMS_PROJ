import axios from "axios";

const API = "/api/teacher-salary-records";

export const getTeacherSalaries = async () => {
  const response = await axios.get(API);
  return response.data;
};

export const getTeacherSalary = async (receiptId) => {
  const response = await axios.get(`${API}/${receiptId}`);
  return response.data;
};

export const createTeacherSalary = async (salary) => {
  const response = await axios.post(API, salary);
  return response.data;
};

export const updateTeacherSalary = async (receiptId, salary) => {
  const response = await axios.put(`${API}/${receiptId}`, salary);
  return response.data;
};

export const deleteTeacherSalary = async (receiptId) => {
  const response = await axios.delete(`${API}/${receiptId}`);
  return response.data;
};