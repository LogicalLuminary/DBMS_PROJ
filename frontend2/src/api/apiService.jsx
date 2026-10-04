// src/api/apiService.js

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Server Error: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('institute_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ==========================================
// AUTHENTICATION
// ==========================================
export const login = async (credentials) => {
  // credentials now safely passes { Email, Credential, Role }
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials), 
  });
  return handleResponse(response);
};

export const logout = async () => {
  const response = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const updatePassword = async (role, id, passwordData) => {
  const rolePath = role.toLowerCase();
  const response = await fetch(`${BASE_URL}/api/${rolePath}/${id}/password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(passwordData), // Should contain uppercase keys if backend expects them (e.g. Old_Credential, New_Credential)
  });
  return handleResponse(response);
};

// ==========================================
// USER REGISTRATION & MANAGEMENT
// ==========================================
export const registerUser = async (role, userData) => {
  const rolePath = role.toLowerCase();
  const response = await fetch(`${BASE_URL}/api/${rolePath}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData), // Component already passing uppercase keys (e.g. First_name, Credential)
  });
  return handleResponse(response);
};

export const deleteUser = async (role, id) => {
  const rolePath = role.toLowerCase();
  const response = await fetch(`${BASE_URL}/api/${rolePath}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ==========================================
// GET LISTS (DROPDOWNS)
// ==========================================
export const getAllCourses = async () => handleResponse(await fetch(`${BASE_URL}/api/course`, { headers: getAuthHeaders() }));
export const getAllBatches = async () => handleResponse(await fetch(`${BASE_URL}/api/batch`, { headers: getAuthHeaders() }));
export const getAllTeachers = async () => handleResponse(await fetch(`${BASE_URL}/api/teacher`, { headers: getAuthHeaders() }));
export const getAllStudents = async () => handleResponse(await fetch(`${BASE_URL}/api/student`, { headers: getAuthHeaders() }));

// ==========================================
// COURSE & BATCH CREATION
// ==========================================
export const createBatch = async (batchData) => {
  const response = await fetch(`${BASE_URL}/api/batch`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(batchData),
  });
  return handleResponse(response);
};

export const createCourseModule = async (moduleData) => {
  // Aligned with CourseModuleController.java
  const response = await fetch(`${BASE_URL}/api/courseModule`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(moduleData),
  });
  return handleResponse(response);
};

export const enrollStudent = async (enrollmentData) => {
  const response = await fetch(`${BASE_URL}/api/enrollment`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(enrollmentData),
  });
  return handleResponse(response);
};

// ==========================================
// FINANCE (FEES & SALARIES)
// ==========================================
export const addFeePayment = async (feeData) => {
  // Aligned with FeePaymentController.java
  const response = await fetch(`${BASE_URL}/api/feePayment`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(feeData),
  });
  return handleResponse(response);
};

export const addSalaryRecord = async (role, salaryData) => {
  // Aligned with TeacherSalaryRecordsController.java & AssistantSalaryRecordsController.java
  const route = role.toLowerCase() === 'teacher' ? 'teacherSalaryRecords' : 'assistantSalaryRecords';
  const response = await fetch(`${BASE_URL}/api/${route}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(salaryData),
  });
  return handleResponse(response);
};

export const getTeacherSalaryRecords = async (teacherId) => {
  // Capitalized query parameter Teacher_id
  const response = await fetch(`${BASE_URL}/api/teacherSalaryRecords?Teacher_id=${teacherId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ==========================================
// STUDENT/TEACHER SPECIFIC FETCHES
// ==========================================
export const getStudentBatches = async (studentId) => {
  // Capitalized query parameter Student_id
  const response = await fetch(`${BASE_URL}/api/enrollment?Student_id=${studentId}`, { headers: getAuthHeaders() });
  return handleResponse(response);
};

export const getBatchDetailsForStudent = async (studentId, batchId) => {
  const response = await fetch(`${BASE_URL}/api/enrollment/${studentId}/${batchId}/details`, { headers: getAuthHeaders() });
  return handleResponse(response);
};

export const getTeacherBatches = async (teacherId) => {
  // Capitalized query parameter Teacher_id
  const response = await fetch(`${BASE_URL}/api/batch?Teacher_id=${teacherId}`, { headers: getAuthHeaders() });
  return handleResponse(response);
};

// ==========================================
// CLASSROOM OPERATIONS
// ==========================================
export const markStudentAttendance = async (attendanceData) => {
  // Aligned with StudentAttendanceController.java
  const response = await fetch(`${BASE_URL}/api/studentAttendance`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(attendanceData),
  });
  return handleResponse(response);
};

export const createTest = async (testData) => {
  const response = await fetch(`${BASE_URL}/api/test`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(testData),
  });
  return handleResponse(response);
};

export const gradeStudent = async (takesData) => {
  const response = await fetch(`${BASE_URL}/api/takes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(takesData),
  });
  return handleResponse(response);
};

// ==========================================
// NOTIFICATIONS
// ==========================================
export const getGlobalNotifications = async () => {
  // Aligned with GlobalnotificationController.java
  const response = await fetch(`${BASE_URL}/api/globalnotification`, { headers: getAuthHeaders() });
  return handleResponse(response);
};

export const createGlobalNotification = async (notificationData) => {
  const response = await fetch(`${BASE_URL}/api/globalnotification`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(notificationData),
  });
  return handleResponse(response);
};

export const createBatchNotification = async (notificationData) => {
  // Aligned with BatchNotificationController.java
  const response = await fetch(`${BASE_URL}/api/batchNotification`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(notificationData),
  });
  return handleResponse(response);
};

// ==========================================
// COMPLAINTS
// ==========================================
export const getComplaints = async (role, id) => {
  // Aligned with StudentComplaintsController.java, TeacherComplaintsController.java, etc.
  const rolePath = role.toLowerCase();
  const response = await fetch(`${BASE_URL}/api/${rolePath}Complaints/${id}`, { headers: getAuthHeaders() });
  return handleResponse(response);
};

export const addComplaint = async (role, complaintData) => {
  const rolePath = role.toLowerCase();
  const response = await fetch(`${BASE_URL}/api/${rolePath}Complaints`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(complaintData),
  });
  return handleResponse(response);
};

export const getAllSystemComplaints = async () => {
  // Assuming a generic path for Admin retrieval
  const response = await fetch(`${BASE_URL}/api/admin/complaints`, { headers: getAuthHeaders() });
  return handleResponse(response);
};