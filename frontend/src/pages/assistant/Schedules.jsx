import { useEffect, useState } from "react";
import scheduleApi from "../../api/scheduleApi";
import batchApi from "../../api/batchApi";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const initialForm = {
  Day: "",
  Batch_id: "",
};

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [form, setForm] = useState(initialForm);

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
      const [batchData, scheduleData] = await Promise.all([
        batchApi.getAll(),
        scheduleApi.getAll(),
      ]);

      setBatches(batchData);
      setSchedules(scheduleData);
    } catch (err) {
      setError("Failed to load batches or schedules.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      ...initialForm,
      Batch_id: selectedBatch,
    });
    setEditing(false);
  }

  function handleBatchChange(event) {
    const batchId = event.target.value;

    setSelectedBatch(batchId);
    setForm({
      ...initialForm,
      Batch_id: batchId,
    });
    setEditing(false);
    setError("");
  }

  function handleEdit(schedule) {
    setForm({
      Day: schedule.day,
      Batch_id: String(schedule.batch_id),
    });

    setSelectedBatch(String(schedule.batch_id));
    setEditing(true);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.Day || !form.Batch_id) {
      setError("Select a day and a batch.");
      return;
    }

    const payload = {
      Day: form.Day,
      Batch_id: Number(form.Batch_id),
    };

    try {
      setSaving(true);

      if (editing) {
        await scheduleApi.update(
          form.Day,
          Number(form.Batch_id),
          payload
        );
      } else {
        await scheduleApi.create(payload);
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the schedule. This day may already be assigned to the batch."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(schedule) {
    const confirmed = window.confirm(
      `Remove ${schedule.day} from batch ${schedule.batch_id}?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await scheduleApi.delete(
        schedule.day,
        schedule.batch_id
      );

      if (
        editing &&
        form.Day === schedule.day &&
        Number(form.Batch_id) === schedule.batch_id
      ) {
        resetForm();
      }

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete this schedule."
      );
    }
  }

  const filteredSchedules = schedules.filter(
    (schedule) =>
      String(schedule.batch_id) === String(selectedBatch)
  );

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold">Batch Schedules</h2>
        <p className="text-muted mb-0">
          Assign and manage scheduled days for each batch.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <label htmlFor="batch" className="form-label">
            Select Batch
          </label>

          <select
            id="batch"
            className="form-select"
            value={selectedBatch}
            onChange={handleBatchChange}
          >
            <option value="">Choose a batch</option>

            {batches.map((batch) => (
              <option
                key={batch.batch_id}
                value={batch.batch_id}
              >
                Batch {batch.batch_id} — Course {batch.course_id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedBatch && (
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  Scheduled Days
                </h5>
              </div>

              <div className="card-body">
                {filteredSchedules.length === 0 ? (
                  <p className="text-muted mb-0">
                    No scheduled days for this batch.
                  </p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Day</th>
                          <th>Batch ID</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredSchedules.map((schedule) => (
                          <tr
                            key={`${schedule.day}-${schedule.batch_id}`}
                          >
                            <td>{schedule.day}</td>
                            <td>{schedule.batch_id}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEdit(schedule)}
                                >
                                  Edit
                                </button>

                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(schedule)}
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
                  {editing ? "Edit Schedule" : "Add Scheduled Day"}
                </h5>
              </div>

              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">
                      Batch ID
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={form.Batch_id}
                      disabled
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Day
                    </label>

                    <select
                      name="Day"
                      className="form-select"
                      value={form.Day}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          Day: event.target.value,
                        }))
                      }
                      disabled={editing}
                      required
                    >
                      <option value="">Select a day</option>

                      {DAYS.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>

                    {editing && (
                      <div className="form-text">
                        The day is part of the primary key and
                        cannot be changed directly.
                      </div>
                    )}
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
                        ? "Update Schedule"
                        : "Add Schedule"}
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

      {!selectedBatch && !loading && (
        <div className="alert alert-info">
          Select a batch to manage its schedule.
        </div>
      )}

      {loading && (
        <p className="text-muted">Loading schedules...</p>
      )}
    </div>
  );
}