import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const dashboardItems = [
  {
    title: "Create Account",
    description: "Create student, teacher, assistant, or admin accounts.",
    path: "/assistant/signup",
    icon: "bi-person-plus",
  },
  {
    title: "Courses",
    description: "Create, update, and manage courses.",
    path: "/assistant/courses",
    icon: "bi-book",
  },
  {
    title: "Course Modules",
    description: "Create, update, and manage modules within courses.",
    path: "/assistant/course-modules",
    icon: "bi-journal-text",
},
  {
    title: "Batches",
    description: "Create and manage batches and schedules.",
    path: "/assistant/batches",
    icon: "bi-people",
  },
  {
    title: "Students",
    description: "View and manage student records and enrollments.",
    path: "/assistant/students",
    icon: "bi-person",
  },
  {
    title: "Teachers",
    description: "Manage teacher profiles and assignments.",
    path: "/assistant/teachers",
    icon: "bi-person-workspace",
  },
  {
    title: "Attendance",
    description: "Record and manage attendance.",
    path: "/assistant/attendance",
    icon: "bi-calendar-check",
  },
  {
    title: "Fee Payments",
    description: "Record offline payments and view payment records.",
    path: "/assistant/fees",
    icon: "bi-cash-stack",
  },
  {
    title: "Tests & Results",
    description: "Manage tests and student results.",
    path: "/assistant/tests",
    icon: "bi-journal-check",
  },
  {
    title: "Notifications",
    description: "Create global and batch notifications.",
    path: "/assistant/notifications",
    icon: "bi-bell",
  },
  {
    title: "Complaints",
    description: "View and manage student and assistant complaints.",
    path: "/assistant/complaints",
    icon: "bi-chat-left-text",
  },
  {
    title: "Teacher Salaries",
    description: "Manage teacher salary payments and records.",
    path: "/assistant/salaries",
    icon: "bi-wallet2",
  },
  {
    title: "Schedules",
    description: "Manage scheduled days for each batch.",
    path: "/assistant/schedules",
    icon: "bi-calendar-week",
  },
  {
    title: "Enrollments",
    description: "Enroll students in batches and manage enrollment records.",
    path: "/assistant/enrollments",
    icon: "bi-person-check",
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold">Assistant Dashboard</h2>
        <p className="text-muted mb-0">
          Welcome! Manage institute operations from here.
        </p>
      </div>

      <div className="row g-3">
        {dashboardItems.map((item) => (
          <div className="col-12 col-sm-6 col-lg-4" key={item.title}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <div className="mb-3">
                  <i
                    className={`bi ${item.icon} fs-2 text-primary`}
                    aria-hidden="true"
                  />
                </div>

                <h5 className="card-title">{item.title}</h5>

                <p className="card-text text-muted">
                  {item.description}
                </p>

                <Link
                  to={item.path}
                  className="btn btn-outline-primary mt-auto"
                >
                  Open
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}