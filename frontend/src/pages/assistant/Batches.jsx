import { useEffect, useState } from "react";
import batchApi from "../../api/batchApi";
import courseApi from "../../api/courseApi";
import axiosInstance from "../../api/axiosInstance";

const initialForm = {
  batch_id: "",
  course_id: "",
  teacher_id: "",
  start_date: "",
  start_time: "",
  end_time: "",
  venue: "",
  modules_completed: 0,
};

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setLoading(true);
    setError("");

    try {
      const [batchData, courseData, teacherResponse] =
        await Promise.all([
          batchApi.getAll(),
          courseApi.getAll(),
          axiosInstance.get("/teacher"),
        ]);

      setBatches(batchData);
      setCourses(courseData);
      setTeachers(teacherResponse.data);
    } catch (err) {
      setError("Failed to load batches, courses, or teachers.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditing(false);
  }

  function handleEdit(batch) {
    setForm({
      batch_id: batch.batch_id,
      course_id: batch.course_id ?? "",
      teacher_id: batch.teacher_id ?? "",
      start_date: batch.start_date ?? "",
      start_time: batch.start_time?.slice(0, 5) ?? "",
      end_time: batch.end_time?.slice(0, 5) ?? "",
      venue: batch.venue ?? "",
      modules_completed: batch.modules_completed ?? 0,
    });

    setEditing(true);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.batch_id || !form.course_id) {
      setError("Batch ID and course are required.");
      return;
    }

    if (
      form.start_time &&
      form.end_time &&
      form.end_time <= form.start_time
    ) {
      setError("End time must be later than start time.");
      return;
    }

    if (
      form.modules_completed === "" ||
      Number(form.modules_completed) < 0
    ) {
      setError("Completed modules cannot be negative.");
      return;
    }

    const payload = {
      batch_id: Number(form.batch_id),
      course_id: Number(form.course_id),
      teacher_id: form.teacher_id
        ? Number(form.teacher_id)
        : null,
      start_date: form.start_date || null,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      venue: form.venue.trim() || null,
      modules_completed: Number(form.modules_completed),
    };

    try {
      setSaving(true);

      if (editing) {
        await batchApi.update(form.batch_id, payload);
      } else {
        await batchApi.create(payload);
      }

      resetForm();
      await loadInitialData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the batch. Check the ID and selected course."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(batch) {
    const confirmed = window.confirm(
      `Delete batch ${batch.batch_id}?\n\n` +
        "This may also delete dependent records such as batch tests " +
        "and notifications. Other foreign-key constraints may prevent deletion."
    );

    if (!confirmed) return;

    setError("");

    try {
      await batchApi.delete(batch.batch_id);

      if (String(form.batch_id) === String(batch.batch_id)) {
        resetForm();
      }

      await loadInitialData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete the batch. It may have dependent records."
      );
    }
  }

  function getCourseName(courseId) {
    const course = courses.find(
      (item) => String(item.course_id) === String(courseId)
    );

    return course
      ? course.course_Name ?? course.course_name
      : `Course ${courseId}`;
  }

  function getTeacherName(teacherId) {
    if (teacherId == null) return "Unassigned";

    const teacher = teachers.find(
      (item) => String(item.teacher_id) === String(teacherId)
    );

    if (!teacher) return `Teacher ${teacherId}`;

    return [
      teacher.first_name,
      teacher.last_name,
    ]
      .filter(Boolean)
      .join(" ") || `Teacher ${teacherId}`;
  }

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold">Batch Management</h2>
        <p className="text-muted mb-0">
          Create batches, assign teachers, and manage schedules.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">All Batches</h5>
            </div>

            <div className="card-body">
              {loading ? (
                <p className="text-muted mb-0">Loading batches...</p>
              ) : batches.length === 0 ? (
                <p className="text-muted mb-0">
                  No batches found.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Course</th>
                        <th>Teacher</th>
                        <th>Start Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {batches.map((batch) => (
                        <tr key={batch.batch_id}>
                          <td>{batch.batch_id}</td>
                          <td>
                            {getCourseName(batch.course_id)}
                          </td>
                          <td>
                            {getTeacherName(batch.teacher_id)}
                          </td>
                          <td>
                            {batch.start_date || "—"}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEdit(batch)}
                              >
                                Edit
                              </button>

                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(batch)}
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
                {editing ? "Edit Batch" : "Create Batch"}
              </h5>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Batch ID</label>
                  <input
                    type="number"
                    name="batch_id"
                    className="form-control"
                    value={form.batch_id}
                    onChange={handleChange}
                    disabled={editing}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Course</label>
                  <select
                    name="course_id"
                    className="form-select"
                    value={form.course_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option
                        key={course.course_id}
                        value={course.course_id}
                      >
                        {course.course_Name ?? course.course_name}
                        {" "}({course.course_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Teacher</label>
                  <select
                    name="teacher_id"
                    className="form-select"
                    value={form.teacher_id}
                    onChange={handleChange}
                  >
                    <option value="">Unassigned</option>
                    {teachers.map((teacher) => (
                      <option
                        key={teacher.teacher_id}
                        value={teacher.teacher_id}
                      >
                        {getTeacherName(teacher.teacher_id)}
                        {" "}({teacher.teacher_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    className="form-control"
                    value={form.start_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Start Time</label>
                    <input
                      type="time"
                      name="start_time"
                      className="form-control"
                      value={form.start_time}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">End Time</label>
                    <input
                      type="time"
                      name="end_time"
                      className="form-control"
                      value={form.end_time}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Venue</label>
                  <input
                    type="text"
                    name="venue"
                    className="form-control"
                    value={form.venue}
                    onChange={handleChange}
                    maxLength={255}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Modules Completed
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="modules_completed"
                    className="form-control"
                    value={form.modules_completed}
                    onChange={handleChange}
                  />
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editing
                      ? "Update Batch"
                      : "Create Batch"}
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
    </div>
  );
}