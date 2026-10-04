import { Routes, Route, Navigate } from 'react-router-dom';
import { Guard, DashboardLayout, PublicLayout, NAV } from './layout';
import { Home, About, Catalog, Login } from './pages/Public';
import { Profile, Complaints, GlobalNotifications } from './pages/Common';
import { BatchShell } from './pages/BatchShell';
import { StudentBatches, TeacherBatches, TeacherSalary } from './pages/Portal';
import { Users, Courses, Batches, Enrollments, Fees, Salaries, Attendance, MyRecords } from './pages/Staff';

function RoleRoutes({ role }) {
  const staff = role === 'assistant' || role === 'admin';
  return (
    <DashboardLayout role={role}>
      <Routes>
        <Route index element={<Navigate to={NAV[role][0][0]} replace />} />
        {role === 'student' && <Route path="batches" element={<StudentBatches />} />}
        {role === 'teacher' && <Route path="batches" element={<TeacherBatches />} />}
        {role === 'teacher' && <Route path="salary" element={<TeacherSalary />} />}
        {staff && <>
          <Route path="users" element={<Users />} />
          <Route path="courses" element={<Courses />} />
          <Route path="batches" element={<Batches />} />
          <Route path="enrollments" element={<Enrollments mode="enroll" />} />
          <Route path="certificates" element={<Enrollments mode="cert" />} />
          <Route path="fees" element={<Fees />} />
          <Route path="salaries" element={<Salaries />} />
          <Route path="attendance" element={<Attendance />} />
        </>}
        {role === 'assistant' && <Route path="records" element={<MyRecords />} />}
        <Route path="batches/:batchId/*" element={<BatchShell role={role} />} />
        <Route path="notifications" element={<GlobalNotifications />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to={NAV[role][0][0]} replace />} />
      </Routes>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/login" element={<Login />} />
      </Route>
      {['student', 'teacher', 'assistant', 'admin'].map((r) => (
        <Route key={r} path={`/${r}/*`} element={<Guard role={r}><RoleRoutes role={r} /></Guard>} />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
