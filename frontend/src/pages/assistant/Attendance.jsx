import { useEffect, useMemo, useState } from "react";
import studentAttendanceApi from "../../api/studentAttendanceApi";
import studentApi from "../../api/studentApi";
import batchApi from "../../api/batchApi";
import enrollmentApi from "../../api/enrollmentApi";

const today = () => new Date().toISOString().slice(0, 10);

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedDate, setSelectedDate] = useState(today());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setLoading(true);
    setError("");

    try {
      const [studentData, batchData, enrollmentData, attendanceData] =
        await Promise.all([
          studentApi.getAll(),
          batchApi.getAll(),
          enrollmentApi.getAll(),
          studentAttendanceApi.getAll(),
        ]);

      setStudents(studentData);
      setBatches(batchData);
      setEnrollments(enrollmentData);
      setAttendance(attendanceData);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load attendance data."
      );
    } finally {
      setLoading(false);
    }
  }

  const enrolledStudents = useMemo(() => {
    if (!selectedBatch) return [];

    const enrolledIds = new Set(
      enrollments
        .filter(
          (enrollment) =>
            String(enrollment.batch_id) === String(selectedBatch)
        )
        .map((enrollment) => String(enrollment.student_id))
    );

    return students.filter((student) =>
      enrolledIds.has(String(student.student_id))
    );
  }, [students, enrollments, selectedBatch]);

  const attendanceMap = useMemo(() => {
    const map = new Map();

    attendance
      .filter(
        (record) =>
          record.date === selectedDate &&
          String(record.batch_id) === String(selectedBatch)
      )
      .forEach((record) => {
        map.set(String(record.student_id), record);
      });

    return map;
  }, [attendance, selectedDate, selectedBatch]);

  function getStudentName(student) {
    return [
      student.first_name,
      student.last_name,
    ]
      .filter(Boolean)
      .join(" ");
  }

  function getStatus(studentId) {
    const record = attendanceMap.get(String(studentId));
    return record ? String(record.status) : "";
  }

  async function saveAttendance(student, status) {
    if (!selectedBatch || !selectedDate) {
      setError("Select a batch and date first.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const studentId = student.student_id;
    const existing = attendanceMap.get(String(studentId));

    const payload = {
      Date: selectedDate,
      Student_id: Number(studentId),
      Batch_id: Number(selectedBatch),
      Status: Number(status),
    };

    try {
      if (existing) {
        await studentAttendanceApi.update(
          selectedDate,
          studentId,
          selectedBatch,
          payload
        );
      } else {
        await studentAttendanceApi.create(payload);
      }

      await refreshAttendance();
      setSuccess("Attendance saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save attendance."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteAttendance(studentId) {
    const confirmed = window.confirm(
      "Delete this attendance record?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await studentAttendanceApi.delete(
        selectedDate,
        studentId,
        selectedBatch
      );

      await refreshAttendance();
      setSuccess("Attendance record deleted.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete attendance."
      );
    }
  }

  async function refreshAttendance() {
    const data = await studentAttendanceApi.getAll();
    setAttendance(data);
  }

  const presentCount = enrolledStudents.filter(
    (student) => getStatus(student.student_id) === "1"
  ).length;

  const absentCount = enrolledStudents.filter(
    (student) => getStatus(student.student_id) === "0"
  ).length;

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">Loading attendance...</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Student Attendance</h2>
          <p className="text-muted mb-0">
            Record and manage student attendance.
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={loadInitialData}
          disabled={saving}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {success && (
        <div className="alert alert-success">{success}</div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Batch</label>
              <select
                className="form-select"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
              >
                <option value="">Select a batch</option>
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

            <div className="col-md-6">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {selectedBatch && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="text-muted">Enrolled students</div>
                  <h3>{enrolledStudents.length}</h3>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="text-muted">Present</div>
                  <h3 className="text-success">{presentCount}</h3>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="text-muted">Absent</div>
                  <h3 className="text-danger">{absentCount}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                Attendance for {selectedDate}
              </h5>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {enrolledStudents.map((student) => {
                    const status = getStatus(student.student_id);

                    return (
                      <tr key={student.student_id}>
                        <td>{student.student_id}</td>
                        <td>{getStudentName(student) || "—"}</td>

                        <td>
                          {status === "1" ? (
                            <span className="badge bg-success">
                              Present
                            </span>
                          ) : status === "0" ? (
                            <span className="badge bg-danger">
                              Absent
                            </span>
                          ) : (
                            <span className="badge bg-secondary">
                              Not marked
                            </span>
                          )}
                        </td>

                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-success"
                              disabled={saving}
                              onClick={() =>
                                saveAttendance(student, 1)
                              }
                            >
                              Present
                            </button>

                            <button
                              className="btn btn-sm btn-danger"
                              disabled={saving}
                              onClick={() =>
                                saveAttendance(student, 0)
                              }
                            >
                              Absent
                            </button>

                            {status !== "" && (
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                disabled={saving}
                                onClick={() =>
                                  deleteAttendance(student.student_id)
                                }
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {enrolledStudents.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        No enrolled students found for this batch.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!selectedBatch && (
        <div className="alert alert-info">
          Select a batch to view and manage attendance.
        </div>
      )}
    </div>
  );
}