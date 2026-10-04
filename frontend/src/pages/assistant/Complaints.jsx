import { useEffect, useState } from "react";

import {
  getStudentComplaints,
  createStudentComplaint,
  updateStudentComplaint,
  deleteStudentComplaint,
} from "../../api/studentComplaintsApi";

import {
  getTeacherComplaints,
  createTeacherComplaint,
  updateTeacherComplaint,
  deleteTeacherComplaint,
} from "../../api/teacherComplaintsApi";

import {
  getAssistantComplaints,
  createAssistantComplaint,
  updateAssistantComplaint,
  deleteAssistantComplaint,
} from "../../api/assistantComplaintsApi";

const emptyForm = {
  Complaint_id: "",
  person_id: "",
  title: "",
  Complaint_date: "",
  Complaint_time: "",
  Complaint_description: "",
};

const configurations = {
  student: {
    label: "Student",
    personField: "Student_id",
    titleField: "Title",
    get: getStudentComplaints,
    create: createStudentComplaint,
    update: updateStudentComplaint,
    remove: deleteStudentComplaint,
  },
  teacher: {
    label: "Teacher",
    personField: "Teacher_id",
    titleField: "Title",
    get: getTeacherComplaints,
    create: createTeacherComplaint,
    update: updateTeacherComplaint,
    remove: deleteTeacherComplaint,
  },
  assistant: {
    label: "Assistant",
    personField: "Assistant_id",
    titleField: "Complaint_Title",
    get: getAssistantComplaints,
    create: createAssistantComplaint,
    update: updateAssistantComplaint,
    remove: deleteAssistantComplaint,
  },
};

export default function Complaints() {
  const [tab, setTab] = useState("student");
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const config = configurations[tab];

  const getField = (item, field) =>
    item[field] ?? item[field.charAt(0).toLowerCase() + field.slice(1)];

  const loadComplaints = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await config.get();
      setComplaints(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setForm(emptyForm);
    setEditing(false);
    loadComplaints();
  }, [tab]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      Complaint_id: Number(form.Complaint_id),
      [config.personField]: Number(form.person_id),
      [config.titleField]: form.title,
      Complaint_date: form.Complaint_date,
      Complaint_time: form.Complaint_time,
      Complaint_description: form.Complaint_description,
    };

    try {
      if (editing) {
        await config.update(
          payload.Complaint_id,
          payload[config.personField],
          payload
        );
      } else {
        await config.create(payload);
      }

      resetForm();
      await loadComplaints();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save complaint."
      );
    }
  };

  const handleEdit = (item) => {
    setForm({
      Complaint_id: getField(item, "Complaint_id"),
      person_id: getField(item, config.personField),
      title: getField(item, config.titleField) ?? "",
      Complaint_date:
        getField(item, "Complaint_date") ?? "",
      Complaint_time:
        getField(item, "Complaint_time")?.slice(0, 5) ?? "",
      Complaint_description:
        getField(item, "Complaint_description") ?? "",
    });

    setEditing(true);
  };

  const handleDelete = async (item) => {
    const complaintId = getField(item, "Complaint_id");
    const personId = getField(item, config.personField);

    if (
      !window.confirm(
        `Delete complaint ${complaintId} belonging to ${config.label} ${personId}?`
      )
    ) {
      return;
    }

    setError("");

    try {
      await config.remove(complaintId, personId);
      await loadComplaints();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete complaint."
      );
    }
  };

  return (
    <div className="container py-4">
      <h2>Complaint Management</h2>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <div className="btn-group my-3">
        {Object.entries(configurations).map(([key, value]) => (
          <button
            key={key}
            className={`btn ${
              tab === key
                ? "btn-primary"
                : "btn-outline-primary"
            }`}
            onClick={() => setTab(key)}
          >
            {value.label} Complaints
          </button>
        ))}
      </div>

      <h4>{editing ? "Edit Complaint" : "Create Complaint"}</h4>

      <form
        onSubmit={handleSubmit}
        className="card card-body mb-4"
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Complaint ID</label>
            <input
              type="number"
              name="Complaint_id"
              className="form-control"
              value={form.Complaint_id}
              onChange={handleChange}
              disabled={editing}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">
              {config.personField.replace("_", " ")}
            </label>
            <input
              type="number"
              name="person_id"
              className="form-control"
              value={form.person_id}
              onChange={handleChange}
              disabled={editing}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label">Title</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Date</label>
            <input
              type="date"
              name="Complaint_date"
              className="form-control"
              value={form.Complaint_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Time</label>
            <input
              type="time"
              name="Complaint_time"
              className="form-control"
              value={form.Complaint_time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea
              name="Complaint_description"
              className="form-control"
              rows="3"
              value={form.Complaint_description}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mt-3">
          <button className="btn btn-primary me-2">
            {editing ? "Update Complaint" : "Create Complaint"}
          </button>

          {editing && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h4>{config.label} Complaints</h4>

      {loading ? (
        <p>Loading complaints...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>{config.personField}</th>
                <th>Title</th>
                <th>Date</th>
                <th>Time</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {complaints.map((item) => {
                const id = getField(item, "Complaint_id");
                const personId = getField(
                  item,
                  config.personField
                );

                return (
                  <tr key={`${id}-${personId}`}>
                    <td>{id}</td>
                    <td>{personId}</td>
                    <td>
                      {getField(item, config.titleField)}
                    </td>
                    <td>
                      {getField(item, "Complaint_date")}
                    </td>
                    <td>
                      {getField(item, "Complaint_time")}
                    </td>
                    <td>
                      {getField(
                        item,
                        "Complaint_description"
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(item)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}

              {complaints.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center">
                    No complaints found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}