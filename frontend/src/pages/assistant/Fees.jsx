import { useEffect, useMemo, useState } from "react";
import feePaymentApi from "../../api/feePaymentApi";
import feeDetailsApi from "../../api/feeDetailsApi";
import studentApi from "../../api/studentApi";
import batchApi from "../../api/batchApi";

const emptyPayment = {
  Receipt_id: "",
  Student_id: "",
  Batch_id: "",
  Amount: "",
  Payment_date: "",
  Payment_time: "",
  Mode_of_payment: "",
};

const emptyDetail = {
  Receipt_id: "",
  Description: "",
};

export default function Fees() {
  const [payments, setPayments] = useState([]);
  const [details, setDetails] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);

  const [paymentForm, setPaymentForm] = useState(emptyPayment);
  const [detailForm, setDetailForm] = useState(emptyDetail);

  const [editingReceipt, setEditingReceipt] = useState(null);
  const [editingDetail, setEditingDetail] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [paymentData, detailData, studentData, batchData] =
        await Promise.all([
          feePaymentApi.getAll(),
          feeDetailsApi.getAll(),
          studentApi.getAll(),
          batchApi.getAll(),
        ]);

      setPayments(paymentData);
      setDetails(detailData);
      setStudents(studentData);
      setBatches(batchData);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load fee information."
      );
    } finally {
      setLoading(false);
    }
  }

  function handlePaymentChange(e) {
    const { name, value } = e.target;

    setPaymentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleDetailChange(e) {
    const { name, value } = e.target;

    setDetailForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function getStudentName(studentId) {
    const student = students.find(
      (s) => String(s.student_id) === String(studentId)
    );

    if (!student) return `Student ${studentId}`;

    return [student.first_name, student.last_name]
      .filter(Boolean)
      .join(" ");
  }

  const filteredPayments = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return payments;

    return payments.filter((payment) => {
      const studentName = getStudentName(payment.student_id);

      return (
        String(payment.receipt_id)
          .toLowerCase()
          .includes(value) ||
        String(payment.student_id)
          .toLowerCase()
          .includes(value) ||
        studentName.toLowerCase().includes(value) ||
        String(payment.batch_id)
          .toLowerCase()
          .includes(value)
      );
    });
  }, [payments, search, students]);

  async function handlePaymentSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      Receipt_id: Number(paymentForm.Receipt_id),
      Student_id: Number(paymentForm.Student_id),
      Batch_id: Number(paymentForm.Batch_id),
      Amount: paymentForm.Amount,
      Payment_date: paymentForm.Payment_date,
      Payment_time: paymentForm.Payment_time,
      Mode_of_payment: paymentForm.Mode_of_payment,
    };

    try {
      if (editingReceipt !== null) {
        await feePaymentApi.update(editingReceipt, payload);
        setSuccess("Fee payment updated successfully.");
      } else {
        await feePaymentApi.create(payload);
        setSuccess("Fee payment created successfully.");
      }

      resetPaymentForm();
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save fee payment."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDetailSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      Receipt_id: Number(detailForm.Receipt_id),
      Description: detailForm.Description.trim(),
    };

    try {
      if (editingDetail) {
        await feeDetailsApi.update(
          editingDetail.receiptId,
          editingDetail.description,
          payload
        );

        setSuccess("Fee detail updated successfully.");
      } else {
        await feeDetailsApi.create(payload);
        setSuccess("Fee detail added successfully.");
      }

      resetDetailForm();
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save fee detail."
      );
    } finally {
      setSaving(false);
    }
  }

  function editPayment(payment) {
    setEditingReceipt(payment.receipt_id);

    setPaymentForm({
      Receipt_id: payment.receipt_id,
      Student_id: payment.student_id,
      Batch_id: payment.batch_id,
      Amount: payment.amount,
      Payment_date: payment.payment_date,
      Payment_time: payment.payment_time,
      Mode_of_payment: payment.mode_of_payment,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function editDetail(detail) {
    setEditingDetail({
      receiptId: detail.receipt_id,
      description: detail.description,
    });

    setDetailForm({
      Receipt_id: detail.receipt_id,
      Description: detail.description,
    });
  }

  async function deletePayment(receiptId) {
    if (
      !window.confirm(
        `Delete receipt ${receiptId}? Its fee details will also be deleted because Fee_Details references Fee_Payment with ON DELETE CASCADE.`
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await feePaymentApi.delete(receiptId);
      setSuccess("Fee payment deleted successfully.");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete fee payment."
      );
    }
  }

  async function deleteDetail(receiptId, description) {
    if (!window.confirm("Delete this fee detail?")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await feeDetailsApi.delete(receiptId, description);
      setSuccess("Fee detail deleted successfully.");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete fee detail."
      );
    }
  }

  function resetPaymentForm() {
    setEditingReceipt(null);
    setPaymentForm(emptyPayment);
  }

  function resetDetailForm() {
    setEditingDetail(null);
    setDetailForm(emptyDetail);
  }

  function getDetailsForReceipt(receiptId) {
    return details.filter(
      (detail) =>
        String(detail.receipt_id) === String(receiptId)
    );
  }

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          Loading fee information...
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2>Fee Management</h2>
        <p className="text-muted mb-0">
          Manage offline fee payments and receipt details.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Payment form */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            {editingReceipt !== null
              ? `Edit Receipt ${editingReceipt}`
              : "Record Fee Payment"}
          </h5>
        </div>

        <div className="card-body">
          <form onSubmit={handlePaymentSubmit}>
            <div className="row g-3">
              <div className="col-md-2">
                <label className="form-label">
                  Receipt ID
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="Receipt_id"
                  value={paymentForm.Receipt_id}
                  onChange={handlePaymentChange}
                  disabled={editingReceipt !== null}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Student
                </label>

                <select
                  className="form-select"
                  name="Student_id"
                  value={paymentForm.Student_id}
                  onChange={handlePaymentChange}
                  required
                >
                  <option value="">
                    Select student
                  </option>

                  {students.map((student) => (
                    <option
                      key={student.student_id}
                      value={student.student_id}
                    >
                      {student.student_id} —{" "}
                      {getStudentName(student.student_id)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Batch
                </label>

                <select
                  className="form-select"
                  name="Batch_id"
                  value={paymentForm.Batch_id}
                  onChange={handlePaymentChange}
                  required
                >
                  <option value="">
                    Select batch
                  </option>

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

              <div className="col-md-2">
                <label className="form-label">
                  Amount
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  name="Amount"
                  value={paymentForm.Amount}
                  onChange={handlePaymentChange}
                  required
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">
                  Payment Mode
                </label>

                <input
                  type="text"
                  maxLength="50"
                  className="form-control"
                  name="Mode_of_payment"
                  placeholder="Cash / UPI / etc."
                  value={paymentForm.Mode_of_payment}
                  onChange={handlePaymentChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Payment Date
                </label>

                <input
                  type="date"
                  className="form-control"
                  name="Payment_date"
                  value={paymentForm.Payment_date}
                  onChange={handlePaymentChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Payment Time
                </label>

                <input
                  type="time"
                  className="form-control"
                  name="Payment_time"
                  value={paymentForm.Payment_time}
                  onChange={handlePaymentChange}
                  required
                />
              </div>
            </div>

            <div className="mt-3 d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {editingReceipt !== null
                  ? "Update Payment"
                  : "Record Payment"}
              </button>

              {editingReceipt !== null && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetPaymentForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Fee details form */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            {editingDetail
              ? "Edit Fee Detail"
              : "Add Fee Detail"}
          </h5>
        </div>

        <div className="card-body">
          <form onSubmit={handleDetailSubmit}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">
                  Receipt ID
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="Receipt_id"
                  value={detailForm.Receipt_id}
                  onChange={handleDetailChange}
                  disabled={editingDetail !== null}
                  required
                />
              </div>

              <div className="col-md-7">
                <label className="form-label">
                  Description
                </label>

                <input
                  type="text"
                  maxLength="255"
                  className="form-control"
                  name="Description"
                  value={detailForm.Description}
                  onChange={handleDetailChange}
                  disabled={editingDetail !== null}
                  required
                />
              </div>

              <div className="col-md-2 d-flex align-items-end">
                <button
                  type="submit"
                  className="btn btn-outline-primary w-100"
                  disabled={saving}
                >
                  {editingDetail ? "Update" : "Add"}
                </button>
              </div>
            </div>

            {editingDetail && (
              <button
                type="button"
                className="btn btn-secondary mt-3"
                onClick={resetDetailForm}
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Payment records */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Payment Records
          </h5>

          <input
            type="text"
            className="form-control"
            style={{ maxWidth: "300px" }}
            placeholder="Search receipt, student, batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Receipt</th>
                <th>Student</th>
                <th>Batch</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Time</th>
                <th>Mode</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.receipt_id}>
                  <td>{payment.receipt_id}</td>

                  <td>
                    {payment.student_id}
                    <br />
                    <small className="text-muted">
                      {getStudentName(payment.student_id)}
                    </small>
                  </td>

                  <td>{payment.batch_id}</td>

                  <td>
                    ₹{Number(payment.amount).toFixed(2)}
                  </td>

                  <td>{payment.payment_date}</td>

                  <td>{payment.payment_time}</td>

                  <td>{payment.mode_of_payment}</td>

                  <td>
                    {getDetailsForReceipt(
                      payment.receipt_id
                    ).map((detail) => (
                      <div
                        key={`${detail.receipt_id}-${detail.description}`}
                        className="mb-2"
                      >
                        <span className="me-2">
                          {detail.description}
                        </span>

                        <button
                          className="btn btn-sm btn-outline-secondary me-1"
                          onClick={() =>
                            editDetail(detail)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            deleteDetail(
                              detail.receipt_id,
                              detail.description
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    ))}

                    {getDetailsForReceipt(
                      payment.receipt_id
                    ).length === 0 && (
                      <span className="text-muted">
                        No details
                      </span>
                    )}
                  </td>

                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() =>
                          editPayment(payment)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          deletePayment(
                            payment.receipt_id
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center py-4"
                  >
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}