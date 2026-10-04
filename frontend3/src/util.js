export const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
export const nowTime = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(11, 19);
export const fullName = (p) => (p ? [p.first_name, p.last_name].filter(Boolean).join(' ') : '');
export const initials = (p) => {
  const n = fullName(p) || p?.email || '?';
  const parts = n.trim().split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
};
export const nextId = (arr, field, pred = () => true) => Math.max(0, ...arr.filter(pred).map((x) => Number(x[field]) || 0)) + 1;
export const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const hhmm = (t) => (t ? String(t).slice(0, 5) : '—');
export const toTime = (t) => (t && t.length === 5 ? t + ':00' : t || null);
export const blank = (v) => (v === '' || v === undefined ? null : v);
export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
export const payable = (course, enr) => Number(course?.price || 0) * (1 - Number(enr?.discount || 0) / 100);
export const byId = (list, field, id) => list.find((x) => x[field] === id);
export const batchLabel = (b, courses) => {
  const c = byId(courses, 'course_id', b.course_id);
  return `${c?.course_Name || 'Course'} — ${b.start_date || 'TBD'} ${hhmm(b.start_time)}`;
};
