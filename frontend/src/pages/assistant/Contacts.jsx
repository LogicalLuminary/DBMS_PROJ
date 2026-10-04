import { useEffect, useState } from "react";

import {
  getStudentContacts,
  createStudentContact,
  updateStudentContact,
  deleteStudentContact,
} from "../../api/studentContactsApi";

import {
  getTeacherContacts,
  createTeacherContact,
  updateTeacherContact,
  deleteTeacherContact,
} from "../../api/teacherContactsApi";

import {
  getAssistantContacts,
  createAssistantContact,
  updateAssistantContact,
  deleteAssistantContact,
} from "../../api/assistantContactsApi";

import {
  getAdminContacts,
  createAdminContact,
  updateAdminContact,
  deleteAdminContact,
} from "../../api/adminContactsApi";

const CONFIG = {
  student: {
    label: "Student",
    idLabel: "Student ID",
    idField: "student_id",
    get: getStudentContacts,
    create: createStudentContact,
    update: updateStudentContact,
    remove: deleteStudentContact,
  },

  teacher: {
    label: "Teacher",
    idLabel: "Teacher ID",
    idField: "teacher_id",
    get: getTeacherContacts,
    create: createTeacherContact,
    update: updateTeacherContact,
    remove: deleteTeacherContact,
  },

  assistant: {
    label: "Assistant",
    idLabel: "Assistant ID",
    idField: "assistant_id",
    get: getAssistantContacts,
    create: createAssistantContact,
    update: updateAssistantContact,
    remove: deleteAssistantContact,
  },

  admin: {
    label: "Admin",
    idLabel: "Admin ID",
    idField: "admin_id",
    get: getAdminContacts,
    create: createAdminContact,
    update: updateAdminContact,
    remove: deleteAdminContact,
  },
};

export default function Contacts() {
  const [type, setType] = useState("student");
  const [contacts, setContacts] = useState([]);

  const [form, setForm] = useState({
    ownerId: "",
    phoneNo: "",
  });

  const [editing, setEditing] = useState(false);
  const [oldKey, setOldKey] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const config = CONFIG[type];

  useEffect(() => {
    loadContacts();
  }, [type]);

  const loadContacts = async () => {
    try {
      setError("");

      const data = await config.get();
      setContacts(data || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          `Failed to load ${config.label.toLowerCase()} contacts.`
      );
    }
  };

  const resetForm = () => {
    setForm({
      ownerId: "",
      phoneNo: "",
    });

    setEditing(false);
    setOldKey(null);
  };

  const changeType = (newType) => {
    setType(newType);

    setForm({
      ownerId: "",
      phoneNo: "",
    });

    setEditing(false);
    setOldKey(null);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      const ownerId = Number(form.ownerId);
      const phoneNo = form.phoneNo.trim();

      if (!ownerId || !phoneNo) {
        setError("Both ID and phone number are required.");
        return;
      }

      const payload = {
        [config.idField]: ownerId,
        phone_no: phoneNo,
      };

      if (editing) {
        await config.update(
          oldKey.ownerId,
          oldKey.phoneNo,
          payload
        );

        setMessage(
          `${config.label} contact updated successfully.`
        );
      } else {
        await config.create(payload);

        setMessage(
          `${config.label} contact created successfully.`
        );
      }

      resetForm();
      await loadContacts();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          `Failed to save ${config.label.toLowerCase()} contact.`
      );
    }
  };

  const handleEdit = (contact) => {
    const ownerId = contact[config.idField];

    setForm({
      ownerId: ownerId,
      phoneNo: contact.phone_no,
    });

    setOldKey({
      ownerId,
      phoneNo: contact.phone_no,
    });

    setEditing(true);
    setError("");
    setMessage("");
  };

  const handleDelete = async (contact) => {
    const ownerId = contact[config.idField];
    const phoneNo = contact.phone_no;

    if (
      !window.confirm(
        `Delete phone number ${phoneNo} for ${config.label} ID ${ownerId}?`
      )
    ) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await config.remove(ownerId, phoneNo);

      setMessage(
        `${config.label} contact deleted successfully.`
      );

      await loadContacts();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          `Failed to delete ${config.label.toLowerCase()} contact.`
      );
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Contacts</h2>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      <div className="btn-group mb-4">
        {Object.entries(CONFIG).map(
          ([key, item]) => (
            <button
              key={key}
              type="button"
              className={`btn ${
                type === key
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => changeType(key)}
            >
              {item.label}
            </button>
          )
        )}
      </div>

      <div className="card mb-4">
        <div className="card-header">
          {editing
            ? `Edit ${config.label} Contact`
            : `Add ${config.label} Contact`}
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-5">
                <label className="form-label">
                  {config.idLabel}
                </label>

                <input
                  type="number"
                  className="form-control"
                  value={form.ownerId}
                  disabled={editing}
                  required
                  onChange={(e) =>
                    setForm({
                      ...form,
                      ownerId: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-5">
                <label className="form-label">
                  Phone Number
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={form.phoneNo}
                  required
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phoneNo: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-2 d-flex align-items-end">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                >
                  {editing ? "Update" : "Add"}
                </button>
              </div>
            </div>

            {editing && (
              <button
                type="button"
                className="btn btn-secondary mt-3"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          {config.label} Contacts
        </div>

        <div className="table-responsive">
          <table className="table table-striped mb-0">
            <thead>
              <tr>
                <th>{config.idLabel}</th>
                <th>Phone Number</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center"
                  >
                    No contacts found.
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => {
                  const ownerId =
                    contact[config.idField];

                  return (
                    <tr
                      key={`${ownerId}-${contact.phone_no}`}
                    >
                      <td>{ownerId}</td>

                      <td>{contact.phone_no}</td>

                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-warning me-2"
                          onClick={() =>
                            handleEdit(contact)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            handleDelete(contact)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}