// All JSON field names below are EXACTLY what the Spring backend (Jackson) expects,
// e.g. batch_id, course_Name, modules_Completed, lastSeen_Global_Notification_id.
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    credentials: 'include', // backend uses an HTTP session cookie
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = data && (data.error || data.message || data.details);
    throw new Error((typeof msg === 'string' && msg) || `Request failed (${res.status})`);
  }
  return data;
}

export const RES = {
  student: '/api/student', teacher: '/api/teacher', assistant: '/api/assistant', admin: '/api/admin',
  course: '/api/course', courseModule: '/api/course-module', batch: '/api/batch',
  enrollment: '/api/enrollment', schedule: '/api/schedule', test: '/api/test', takes: '/api/takes',
  studentAttendance: '/api/student-attendance', teacherAttendance: '/api/teacher-attendance-record',
  assistantAttendance: '/api/assistant-attendance-record',
  batchNotification: '/api/batch-notification', globalNotification: '/api/globalnotification',
  assistantLastSeen: '/api/assistant-lastseen-notification',
  studentComplaints: '/api/student-complaints', teacherComplaints: '/api/teacher-complaints',
  assistantComplaints: '/api/assistant-complaints',
  feePayment: '/api/fee-payment', feeDetails: '/api/fee-details',
  teacherSalary: '/api/teacher-salary-records', teacherSalaryDetails: '/api/teacher-salary-details',
  assistantSalary: '/api/assistant-salary-records', assistantSalaryDetails: '/api/assistant-salary-details',
  pincode: '/api/pincode',
};

const k = (keys) => [].concat(keys).join('/');
export const api = {
  list: (r) => req('GET', RES[r]),
  get: (r, ...keys) => req('GET', `${RES[r]}/${k(keys)}`),
  // NOTE: backend create() is JPA save() => acts as insert-or-update (upsert)
  create: (r, body) => req('POST', RES[r], body),
  update: (r, keys, body) => req('PUT', `${RES[r]}/${k(keys)}`, body),
  remove: (r, keys) => req('DELETE', `${RES[r]}/${k(keys)}`),
};

export const authApi = {
  login: (b) => req('POST', '/api/auth/login', b), // {role,email,credential}
  signup: (b) => req('POST', '/api/auth/signup', b), // {role,first_name,last_name,email,credential,sex,dob,pincode,aadhar_id}
  me: () => req('GET', '/api/auth/me'),
  logout: () => req('POST', '/api/auth/logout'),
};
