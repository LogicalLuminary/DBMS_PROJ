import axios from "axios";

const API = "/api/teacher-salary-details";

export const getTeacherSalaryDetails = async () => {
  const response = await axios.get(API);
  return response.data;
};

export const createTeacherSalaryDetail = async (detail) => {
  const response = await axios.post(API, detail);
  return response.data;
};

export const updateTeacherSalaryDetail = async (
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

export const deleteTeacherSalaryDetail = async (
  receiptId,
  description
) => {
  const response = await axios.delete(
    `${API}/${receiptId}/${encodeURIComponent(description)}`
  );
  return response.data;
};