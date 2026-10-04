import { useEffect, useState } from "react";
import enrollmentApi from "../../api/enrollmentApi";
import studentApi from "../../api/studentApi";
import batchApi from "../../api/batchApi";

const initialForm = {
  Student_id: "",
  Batch_id: "",
  Batch_Notification_Status: false,
  Enrollment_date: "",
  Feedback: "",
  Certificate: "",
  Discount: "0.00",
};

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [filterBatch, setFilterBatch] = useState("");

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [enrollmentData, studentData, batchData] =
        await Promise.all([
          enrollmentApi.getAll(),
          studentApi.getAll(),
          batchApi.getAll(),
        ]);

      setEnrollments(enrollmentData);
      setStudents(studentData);
      setBatches(batchData);
    } catch (err) {
      setError("Failed to load enrollment data.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditing(false);
  }

  function handleEdit(enrollment) {
    setForm({
      Student_id: String(enrollment.student_id),
      Batch_id: String(enrollment.batch_id),
      Batch_Notification_Status:
        enrollment.batch_notification_status ?? false,
      Enrollment_date: enrollment.enrollment_date ?? "",
      Feedback: enrollment.feedback ?? "",
      Certificate: enrollment.certificate ?? "",
      Discount: String(enrollment.discount ?? "0.00"),
    });

    setEditing(true);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.Student_id || !form.Batch_id) {
      setError("Select a student and a batch.");
      return;
    }

    if (!form.Enrollment_date) {
      setError("Enrollment date is required.");
      return;
    }

    const discount = Number(form.Discount);

    if (
      !Number.isFinite(discount) ||
      discount < 0 ||
      discount > 999.99
    ) {
      setError("Enter a valid discount between 0 and 999.99.");
      return;
    }

    const payload = {
      Student_id: Number(form.Student_id),
      Batch_id: Number(form.Batch_id),
      Batch_Notification_Status:
        form.Batch_Notification_Status,
      Enrollment_date: form.Enrollment_date,
      Feedback: form.Feedback.trim() || null,
      Certificate: form.Certificate.trim() || null,
      Discount: discount,
    };

    try {
      setSaving(true);

      if (editing) {
        await enrollmentApi.update(
          payload.Student_id,
          payload.Batch_id,
          payload
        );
      } else {
        await enrollmentApi.create(payload);
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save enrollment. The student may already be enrolled in this batch."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(enrollment) {
    const confirmed = window.confirm(
      `Remove student ${enrollment.student_id} from batch ${enrollment.batch_id}?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await enrollmentApi.delete(
        enrollment.student_id,
        enrollment.batch_id
      );

      if (
        editing &&
        String(form.Student_id) ===
          String(enrollment.student_id) &&
        String(form.Batch_id) === String(enrollment.batch_id)
      ) {
        resetForm();
      }

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete this enrollment."
      );
    }
  }

  function getStudentName(studentId) {
    const student = students.find(
      (item) => String(item.student_id) === String(studentId)
    );

    if (!student) return `Student ${studentId}`;

    return `${student.first_name ?? ""} ${
      student.last_name ?? ""
    }`.trim();
  }

  const filteredEnrollments = enrollments.filter(
    (enrollment) =>
      !filterBatch ||
      String(enrollment.batch_id) === String(filterBatch)
  );

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold">Enrollment Management</h2>
        <p className="text-muted mb-0">
          Enroll students in batches and manage their enrollment records.
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
              <h5 className="mb-0">Enrollments</h5>
            </div>

            <div className="card-body">
              <label className="form-label" htmlFor="filterBatch">
                Filter by batch
              </label>

              <select
                id="filterBatch"
                className="form-select mb-3"
                value={filterBatch}
                onChange={(event) =>
                  setFilterBatch(event.target.value)
                }
              >
                <option value="">All batches</option>
                {batches.map((batch) => (
                  <option
                    key={batch.batch_id}
                    value={batch.batch_id}
                  >
                    Batch {batch.batch_id}
                  </option>
                ))}
              </select>

              {loading ? (
                <p className="text-muted">Loading enrollments...</p>
              ) : filteredEnrollments.length === 0 ? (
                <p className="text-muted">
                  No enrollments found.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Batch</th>
                        <th>Enrollment Date</th>
                        <th>Discount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredEnrollments.map((enrollment) => (
                        <tr
                          key={`${enrollment.student_id}-${enrollment.batch_id}`}
                        >
                          <td>
                            {getStudentName(enrollment.student_id)}
                            <div className="small text-muted">
                              ID: {enrollment.student_id}
                            </div>
                          </td>

                          <td>{enrollment.batch_id}</td>

                          <td>
                            {enrollment.enrollment_date}
                          </td>

                          <td>{enrollment.discount ?? 0}</td>

                          <td>
                            <div className="d-flex gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEdit(enrollment)}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(enrollment)}
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
                {editing ? "Edit Enrollment" : "Create Enrollment"}
              </h5>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Student</label>

                  <select
                    name="Student_id"
                    className="form-select"
                    value={form.Student_id}
                    onChange={handleChange}
                    disabled={editing}
                    required
                  >
                    <option value="">Select student</option>
                    {students.map((student) => (
                      <option
                        key={student.student_id}
                        value={student.student_id}
                      >
                        {student.first_name} {student.last_name ?? ""}
                        {" "}({student.student_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Batch</label>

                  <select
                    name="Batch_id"
                    className="form-select"
                    value={form.Batch_id}
                    onChange={handleChange}
                    disabled={editing}
                    required
                  >
                    <option value="">Select batch</option>
                    {batches.map((batch) => (
                      <option
                        key={batch.batch_id}
                        value={batch.batch_id}
                      >
                        Batch {batch.batch_id}
                      </option>
                    ))}
                  </select>
                </div>

                {editing && (
                  <div className="form-text mb-3">
                    Student and batch form the composite primary key
                    and cannot be changed here.
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">
                    Enrollment Date
                  </label>

                  <input
                    type="date"
                    name="Enrollment_date"
                    className="form-control"
                    value={form.Enrollment_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Discount
                  </label>

                  <input
                    type="number"
                    name="Discount"
                    className="form-control"
                    min="0"
                    max="999.99"
                    step="0.01"
                    value={form.Discount}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Feedback
                  </label>

                  <textarea
                    name="Feedback"
                    className="form-control"
                    rows="3"
                    value={form.Feedback}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Certificate URL
                  </label>

                  <input
                    type="url"
                    name="Certificate"
                    className="form-control"
                    value={form.Certificate}
                    onChange={handleChange}
                    maxLength={255}
                  />
                </div>

                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    name="Batch_Notification_Status"
                    id="notificationStatus"
                    className="form-check-input"
                    checked={Boolean(
                      form.Batch_Notification_Status
                    )}
                    onChange={handleChange}
                  />

                  <label
                    htmlFor="notificationStatus"
                    className="form-check-label"
                  >
                    Batch notifications enabled
                  </label>
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
                      ? "Update Enrollment"
                      : "Enroll Student"}
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