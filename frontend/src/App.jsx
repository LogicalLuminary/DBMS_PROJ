import { Route, Routes } from "react-router-dom";

// Routes
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRedirect from "./routes/RoleRedirect";

// Layouts
import PublicLayout from "./components/layout/PublicLayout";
import StudentLayout from "./components/layout/StudentLayout";

// Public pages
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Courses from "./pages/public/Courses";
import Login from "./pages/public/Login";

// Student pages
import StudentDashboard from "./pages/student/Dashboard";
import Profile from "./pages/student/Profile";
import StudentBatches from "./pages/student/Batches";
import BatchDetails from "./pages/student/BatchDetails";
import StudentAttendance from "./pages/student/Attendance";
import Progress from "./pages/student/Progress";
import StudentTests from "./pages/student/Tests";

// Assistant pages
import AssistantDashboard from "./pages/assistant/Dashboard";
import AssistantCourses from "./pages/assistant/Courses";
import CourseModules from "./pages/assistant/CourseModules";
import AssistantBatches from "./pages/assistant/Batches";
import Schedules from "./pages/assistant/Schedules";
import Students from "./pages/assistant/Students";
import Enrollments from "./pages/assistant/Enrollments";
import AssistantAttendance from "./pages/assistant/Attendance";
import Fees from "./pages/assistant/Fees";
import AssistantTests from "./pages/assistant/Tests";
import Notifications from "./pages/assistant/Notifications";
import Complaints from "./pages/assistant/Complaints";
import Contacts from "./pages/assistant/Contacts";
import Signup from "./pages/assistant/Signup";

function Unauthorized() {
  return (
    <div className="container text-center py-5">
      <h1>403</h1>
      <h3>Access Denied</h3>
      <p>You do not have permission to access this page.</p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="container text-center py-5">
      <h1>404</h1>
      <h3>Page Not Found</h3>
      <p>The page you are looking for does not exist.</p>

      <a href="/" className="btn btn-primary">
        Go Home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* =========================
          PUBLIC PAGES
          ========================= */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* =========================
          AUTHENTICATED USERS
          ========================= */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<RoleRedirect />} />
      </Route>

      {/* =========================
          STUDENT PAGES
          ========================= */}
      <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />

          <Route path="profile" element={<Profile />} />

          <Route path="batches" element={<StudentBatches />} />
          <Route path="batches/:batchId" element={<BatchDetails />} />

          <Route path="attendance" element={<StudentAttendance />} />

          <Route path="progress" element={<Progress />} />

          <Route path="tests" element={<StudentTests />} />
        </Route>
      </Route>

      {/* =========================
          ASSISTANT PAGES
          ========================= */}
      <Route element={<ProtectedRoute allowedRoles={["ASSISTANT"]} />}>
        <Route
          path="/assistant"
          element={<AssistantDashboard />}
        />

        <Route
          path="/assistant/signup"
          element={<Signup />}
        />

        <Route
          path="/assistant/courses"
          element={<AssistantCourses />}
        />

        <Route
          path="/assistant/course-modules"
          element={<CourseModules />}
        />

        <Route
          path="/assistant/batches"
          element={<AssistantBatches />}
        />

        <Route
          path="/assistant/schedules"
          element={<Schedules />}
        />

        <Route
          path="/assistant/students"
          element={<Students />}
        />

        <Route
          path="/assistant/enrollments"
          element={<Enrollments />}
        />

        <Route
          path="/assistant/attendance"
          element={<AssistantAttendance />}
        />

        <Route
          path="/assistant/fees"
          element={<Fees />}
        />

        <Route
          path="/assistant/tests"
          element={<AssistantTests />}
        />

        <Route
          path="/assistant/notifications"
          element={<Notifications />}
        />

        <Route
          path="/assistant/complaints"
          element={<Complaints />}
        />

        <Route
          path="/assistant/contacts"
          element={<Contacts />}
        />
      </Route>

      {/* =========================
          ERROR PAGES
          ========================= */}
      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}