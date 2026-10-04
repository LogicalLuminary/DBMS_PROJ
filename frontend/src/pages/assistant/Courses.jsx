import { useEffect, useState } from "react";
import courseApi from "../../api/courseApi";

const emptyForm = {
  Course_id: "",
  Course_Name: "",
  Description: "",
  Price: "",
  No_of_modules: "",
  No_of_weeks: "",
  Material: "",
  Category: "",
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCourses = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await courseApi.getAll();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load courses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (course) => {
    setForm({
      Course_id: course.Course_id ?? "",
      Course_Name: course.Course_Name ?? "",
      Description: course.Description ?? "",
      Price: course.Price ?? "",
      No_of_modules: course.No_of_modules ?? "",
      No_of_weeks: course.No_of_weeks ?? "",
      Material: course.Material ?? "",
      Category: course.Category ?? "",
    });

    setEditingId(course.Course_id);
    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const courseId = Number(form.Course_id);
    const price = form.Price === "" ? null : Number(form.Price);
    const modules =
      form.No_of_modules === "" ? null : Number(form.No_of_modules);
    const weeks =
      form.No_of_weeks === "" ? null : Number(form.No_of_weeks);

    if (!editingId && (!Number.isInteger(courseId) || courseId <= 0)) {
      setError("Course ID must be a positive integer.");
      return;
    }

    if (form.Course_Name.trim() === "" || form.Category.trim() === "") {
      setError("Course name and category are required.");
      return;
    }

    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      setError("Price must be a non-negative number.");
      return;
    }

    if (
      modules !== null &&
      (!Number.isInteger(modules) || modules < 0)
    ) {
      setError("Number of modules must be a non-negative integer.");
      return;
    }

    if (weeks !== null && (!Number.isInteger(weeks) || weeks < 0)) {
      setError("Number of weeks must be a non-negative integer.");
      return;
    }

    const payload = {
      Course_id: editingId ?? courseId,
      Course_Name: form.Course_Name.trim(),
      Description: form.Description.trim() || null,
      Price: price,
      No_of_modules: modules,
      No_of_weeks: weeks,
      Material: form.Material.trim() || null,
      Category: form.Category.trim(),
    };

    try {
      setSaving(true);

      if (editingId !== null) {
        await courseApi.update(editingId, payload);
        setSuccess("Course updated successfully.");
      } else {
        await courseApi.create(payload);
        setSuccess("Course created successfully.");
      }

      resetForm();
      await loadCourses();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to save course."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (courseId) => {
    const confirmed = window.confirm(
      `Delete course ${courseId}? This may fail if batches or modules reference it.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(courseId);

    try {
      await courseApi.delete(courseId);
      setSuccess("Course deleted successfully.");

      if (editingId === courseId) {
        resetForm();
      }

      await loadCourses();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to delete course. Check whether dependent records exist."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Course Management</h2>
          <p className="text-muted mb-0">
            Create, update, and manage institute courses.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-header fw-semibold">
          {editingId !== null ? "Edit Course" : "Create Course"}
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label htmlFor="Course_id" className="form-label">
                  Course ID *
                </label>
                <input
                  id="Course_id"
                  name="Course_id"
                  type="number"
                  min="1"
                  step="1"
                  className="form-control"
                  value={form.Course_id}
                  onChange={handleChange}
                  disabled={editingId !== null}
                  required
                />
              </div>

              <div className="col-md-8 mb-3">
                <label htmlFor="Course_Name" className="form-label">
                  Course Name *
                </label>
                <input
                  id="Course_Name"
                  name="Course_Name"
                  type="text"
                  maxLength="150"
                  className="form-control"
                  value={form.Course_Name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="Category" className="form-label">
                  Category *
                </label>
                <input
                  id="Category"
                  name="Category"
                  type="text"
                  maxLength="100"
                  className="form-control"
                  value={form.Category}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="Price" className="form-label">
                  Price
                </label>
                <input
                  id="Price"
                  name="Price"
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control"
                  value={form.Price}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="No_of_modules" className="form-label">
                  Number of Modules
                </label>
                <input
                  id="No_of_modules"
                  name="No_of_modules"
                  type="number"
                  min="0"
                  step="1"
                  className="form-control"
                  value={form.No_of_modules}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="No_of_weeks" className="form-label">
                  Number of Weeks
                </label>
                <input
                  id="No_of_weeks"
                  name="No_of_weeks"
                  type="number"
                  min="0"
                  step="1"
                  className="form-control"
                  value={form.No_of_weeks}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 mb-3">
                <label htmlFor="Description" className="form-label">
                  Description
                </label>
                <textarea
                  id="Description"
                  name="Description"
                  className="form-control"
                  rows="3"
                  value={form.Description}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 mb-3">
                <label htmlFor="Material" className="form-label">
                  Material URL
                </label>
                <input
                  id="Material"
                  name="Material"
                  type="text"
                  className="form-control"
                  value={form.Material}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Course"
                    : "Create Course"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span className="fw-semibold">Courses</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={loadCourses}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        <div className="card-body">
          {loading ? (
            <p className="text-center my-4">Loading courses...</p>
          ) : courses.length === 0 ? (
            <p className="text-center text-muted my-4">
              No courses found.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Modules</th>
                    <th>Weeks</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {courses.map((course) => (
                    <tr key={course.Course_id}>
                      <td>{course.Course_id}</td>
                      <td>{course.Course_Name}</td>
                      <td>{course.Category}</td>
                      <td>
                        {course.Price == null
                          ? "—"
                          : `₹${Number(course.Price).toFixed(2)}`}
                      </td>
                      <td>{course.No_of_modules ?? "—"}</td>
                      <td>{course.No_of_weeks ?? "—"}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(course)}
                            disabled={deletingId !== null}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(course.Course_id)}
                            disabled={deletingId !== null}
                          >
                            {deletingId === course.Course_id
                              ? "Deleting..."
                              : "Delete"}
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
  );
}