import { useEffect, useState } from "react";
import courseApi from "../../api/courseApi";
import courseModuleApi from "../../api/courseModuleApi";

export default function CourseModules() {
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  const [form, setForm] = useState({
    Module_id: "",
    Module_title: "",
    Module_description: "",
  });

  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadModules();
    } else {
      setModules([]);
    }
  }, [selectedCourse]);

  async function loadCourses() {
    try {
      setLoading(true);
      const data = await courseApi.getAll();
      setCourses(data);
    } catch (err) {
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }

  async function loadModules() {
    try {
      setError("");
      const data = await courseModuleApi.getAll();

      setModules(
        data.filter(
          (module) => String(module.course_id) === String(selectedCourse)
        )
      );
    } catch (err) {
      setError("Failed to load course modules.");
    }
  }

  function resetForm() {
    setForm({
      Module_id: "",
      Module_title: "",
      Module_description: "",
    });
    setEditing(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!selectedCourse) {
      setError("Select a course first.");
      return;
    }

    if (
      form.Module_id === "" ||
      !form.Module_title.trim()
    ) {
      setError("Module ID and title are required.");
      return;
    }

    const payload = {
      Module_id: Number(form.Module_id),
      Course_id: Number(selectedCourse),
      Module_title: form.Module_title.trim(),
      Module_description: form.Module_description.trim() || null,
    };

    try {
      if (editing) {
        await courseModuleApi.update(
          payload.Module_id,
          payload.Course_id,
          payload
        );
      } else {
        await courseModuleApi.create(payload);
      }

      resetForm();
      await loadModules();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the module. Check whether the ID already exists."
      );
    }
  }

  function handleEdit(module) {
    setForm({
      Module_id: module.module_id,
      Module_title: module.module_title || "",
      Module_description: module.module_description || "",
    });

    setEditing(true);
    setError("");
  }

  async function handleDelete(module) {
    const confirmed = window.confirm(
      `Delete module "${module.module_title}" from this course?`
    );

    if (!confirmed) return;

    try {
      setError("");
      await courseModuleApi.delete(
        module.module_id,
        module.course_id
      );

      await loadModules();

      if (String(form.Module_id) === String(module.module_id)) {
        resetForm();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete the module."
      );
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Course Modules</h2>
          <p className="text-muted mb-0">
            Manage the modules belonging to each course.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <label htmlFor="course" className="form-label">
            Select Course
          </label>

          <select
            id="course"
            className="form-select"
            value={selectedCourse}
            onChange={(event) => {
              setSelectedCourse(event.target.value);
              resetForm();
              setError("");
            }}
          >
            <option value="">Choose a course</option>
            {courses.map((course) => (
              <option
                key={course.course_id}
                value={course.course_id}
              >
                {course.course_Name || course.course_name}
                {" "}({course.course_id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCourse && (
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Modules</h5>
              </div>

              <div className="card-body">
                {modules.length === 0 ? (
                  <p className="text-muted mb-0">
                    No modules found for this course.
                  </p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Module ID</th>
                          <th>Title</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {modules.map((module) => (
                          <tr
                            key={`${module.course_id}-${module.module_id}`}
                          >
                            <td>{module.module_id}</td>
                            <td>{module.module_title}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEdit(module)}
                                >
                                  Edit
                                </button>

                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(module)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  {editing ? "Edit Module" : "Add Module"}
                </h5>
              </div>

              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">
                      Module ID
                    </label>
                    <input
                      type="number"
                      name="Module_id"
                      className="form-control"
                      value={form.Module_id}
                      onChange={handleChange}
                      disabled={editing}
                      required
                    />
                    <div className="form-text">
                      Module IDs must be unique within a course.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Module Title
                    </label>
                    <input
                      type="text"
                      name="Module_title"
                      className="form-control"
                      value={form.Module_title}
                      onChange={handleChange}
                      maxLength={255}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Description
                    </label>
                    <textarea
                      name="Module_description"
                      className="form-control"
                      rows="4"
                      value={form.Module_description}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      {editing ? "Update Module" : "Add Module"}
                    </button>

                    {editing && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={resetForm}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedCourse && !loading && (
        <div className="alert alert-info">
          Select a course to view or manage its modules.
        </div>
      )}

      {loading && (
        <div className="text-muted">Loading courses...</div>
      )}
    </div>
  );
}