import { useEffect, useState } from "react";
import studentApi from "../../api/studentApi";
import axiosInstance from "../../api/axiosInstance";

const initialForm = {
  student_id: "",
  first_name: "",
  last_name: "",
  sex: "",
  dob: "",
  credential: "",
  email: "",
  house_no: "",
  street: "",
  pincode: "",
  aadhar_id: "",
  lastSeen_Global_Notification_id: "",
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");

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
      const [studentResponse, pincodeResponse] = await Promise.all([
        studentApi.getAll(),
        axiosInstance.get("/pincode"),
      ]);

      setStudents(studentResponse);
      setPincodes(pincodeResponse.data);
    } catch (err) {
      setError("Failed to load students or pincodes.");
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

  function handleEdit(student) {
    setForm({
      student_id: student.student_id,
      first_name: student.first_name ?? "",
      last_name: student.last_name ?? "",
      sex: student.sex ?? "",
      dob: student.dob ?? "",
      credential: "",
      email: student.email ?? "",
      house_no: student.house_no ?? "",
      street: student.street ?? "",
      pincode: student.pincode ?? "",
      aadhar_id: student.aadhar_id ?? "",
      lastSeen_Global_Notification_id:
        student.lastSeen_Global_Notification_id ?? "",
    });

    setEditing(true);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (
      !form.student_id ||
      !form.first_name.trim() ||
      !form.email.trim() ||
      (!editing && !form.credential)
    ) {
      setError(
        "Student ID, first name, email, and a credential for new students are required."
      );
      return;
    }

    const payload = {
      student_id: Number(form.student_id),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim() || null,
      sex: form.sex || null,
      dob: form.dob || null,
      email: form.email.trim(),
      house_no: form.house_no.trim() || null,
      street: form.street.trim() || null,
      pincode: form.pincode || null,
      aadhar_id: form.aadhar_id.trim() || null,
      lastSeen_Global_Notification_id:
        form.lastSeen_Global_Notification_id
          ? Number(form.lastSeen_Global_Notification_id)
          : null,
    };

    // Only send a credential when creating a student.
    // The existing backend entity does not provide a safe
    // password-update workflow through this CRUD endpoint.
    if (!editing) {
      payload.credential = form.credential;
    }

    try {
      setSaving(true);

      if (editing) {
        await studentApi.update(form.student_id, payload);
      } else {
        await studentApi.create(payload);
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the student. Check the ID, email, and Aadhaar ID."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(student) {
    const confirmed = window.confirm(
      `Delete student ${student.first_name} ${student.last_name ?? ""}?\n\n` +
        "This may also delete dependent records, including enrollments, contacts, and complaints."
    );

    if (!confirmed) return;

    setError("");

    try {
      await studentApi.delete(student.student_id);

      if (String(form.student_id) === String(student.student_id)) {
        resetForm();
      }

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete the student."
      );
    }
  }

  const filteredStudents = students.filter((student) => {
    const query = search.toLowerCase();

    return (
      String(student.student_id).includes(query) ||
      (student.first_name ?? "").toLowerCase().includes(query) ||
      (student.last_name ?? "").toLowerCase().includes(query) ||
      (student.email ?? "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold">Student Management</h2>
        <p className="text-muted mb-0">
          Create, search, update, and manage student records.
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
              <h5 className="mb-0">Students</h5>
            </div>

            <div className="card-body">
              <input
                type="search"
                className="form-control mb-3"
                placeholder="Search by ID, name, or email"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              {loading ? (
                <p className="text-muted">Loading students...</p>
              ) : filteredStudents.length === 0 ? (
                <p className="text-muted">No students found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.student_id}>
                          <td>{student.student_id}</td>
                          <td>
                            {student.first_name}{" "}
                            {student.last_name ?? ""}
                          </td>
                          <td>{student.email}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEdit(student)}
                              >
                                Edit
                              </button>

                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(student)}
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
                {editing ? "Edit Student" : "Create Student"}
              </h5>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Student ID</label>
                  <input
                    type="number"
                    name="student_id"
                    className="form-control"
                    value={form.student_id}
                    onChange={handleChange}
                    disabled={editing}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">First Name</label>
                    <input
                      name="first_name"
                      className="form-control"
                      value={form.first_name}
                      onChange={handleChange}
                      maxLength={100}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Last Name</label>
                    <input
                      name="last_name"
                      className="form-control"
                      value={form.last_name}
                      onChange={handleChange}
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                    maxLength={255}
                    required
                  />
                </div>

                {!editing && (
                  <div className="mb-3">
                    <label className="form-label">Credential</label>
                    <input
                      type="password"
                      name="credential"
                      className="form-control"
                      value={form.credential}
                      onChange={handleChange}
                      maxLength={255}
                      required
                    />
                  </div>
                )}

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Sex</label>
                    <select
                      name="sex"
                      className="form-select"
                      value={form.sex}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      className="form-control"
                      value={form.dob}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Aadhaar ID</label>
                  <input
                    name="aadhar_id"
                    className="form-control"
                    value={form.aadhar_id}
                    onChange={handleChange}
                    maxLength={20}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">House Number</label>
                  <input
                    name="house_no"
                    className="form-control"
                    value={form.house_no}
                    onChange={handleChange}
                    maxLength={50}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Street</label>
                  <input
                    name="street"
                    className="form-control"
                    value={form.street}
                    onChange={handleChange}
                    maxLength={150}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Pincode</label>
                  <select
                    name="pincode"
                    className="form-select"
                    value={form.pincode}
                    onChange={handleChange}
                  >
                    <option value="">Select pincode</option>
                    {pincodes.map((pincode) => (
                      <option
                        key={pincode.pincode}
                        value={pincode.pincode}
                      >
                        {pincode.pincode} — {pincode.city},{" "}
                        {pincode.state}
                      </option>
                    ))}
                  </select>
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
                      ? "Update Student"
                      : "Create Student"}
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