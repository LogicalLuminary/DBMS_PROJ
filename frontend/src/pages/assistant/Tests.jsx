import { useEffect, useMemo, useState } from "react";
import testApi from "../../api/testApi";
import takesApi from "../../api/takesApi";
import batchApi from "../../api/batchApi";
import studentApi from "../../api/studentApi";
import enrollmentApi from "../../api/enrollmentApi";

const emptyTest = {
  Test_id: "",
  Batch_id: "",
  Test_title: "",
  Date: "",
  Question_paper_Link: "",
  Answerkey_Link: "",
};

const emptyResult = {
  Student_id: "",
  Batch_id: "",
  Test_id: "",
  Score: "",
};

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const [testForm, setTestForm] = useState(emptyTest);
  const [resultForm, setResultForm] = useState(emptyResult);

  const [editingTest, setEditingTest] = useState(null);
  const [editingResult, setEditingResult] = useState(null);

  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedTest, setSelectedTest] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("tests");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [
        testData,
        resultData,
        batchData,
        studentData,
        enrollmentData,
      ] = await Promise.all([
        testApi.getAll(),
        takesApi.getAll(),
        batchApi.getAll(),
        studentApi.getAll(),
        enrollmentApi.getAll(),
      ]);

      setTests(testData);
      setResults(resultData);
      setBatches(batchData);
      setStudents(studentData);
      setEnrollments(enrollmentData);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load test and result data."
      );
    } finally {
      setLoading(false);
    }
  }

  function getStudentName(studentId) {
    const student = students.find(
      (item) => String(item.student_id) === String(studentId)
    );

    if (!student) return `Student ${studentId}`;

    return [student.first_name, student.last_name]
      .filter(Boolean)
      .join(" ");
  }

  function getTestTitle(testId, batchId) {
    const test = tests.find(
      (item) =>
        String(item.test_id) === String(testId) &&
        String(item.batch_id) === String(batchId)
    );

    return test?.test_title || `Test ${testId}`;
  }

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesBatch =
        !selectedBatch ||
        String(test.batch_id) === String(selectedBatch);

      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        String(test.test_id).includes(term) ||
        String(test.test_title || "").toLowerCase().includes(term);

      return matchesBatch && matchesSearch;
    });
  }, [tests, selectedBatch, search]);

  const batchTests = useMemo(() => {
    if (!resultForm.Batch_id) return [];

    return tests.filter(
      (test) =>
        String(test.batch_id) === String(resultForm.Batch_id)
    );
  }, [tests, resultForm.Batch_id]);

  const enrolledStudents = useMemo(() => {
    if (!resultForm.Batch_id) return [];

    const enrolledIds = new Set(
      enrollments
        .filter(
          (enrollment) =>
            String(enrollment.batch_id) ===
            String(resultForm.Batch_id)
        )
        .map((enrollment) => String(enrollment.student_id))
    );

    return students.filter((student) =>
      enrolledIds.has(String(student.student_id))
    );
  }, [students, enrollments, resultForm.Batch_id]);

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      const matchesBatch =
        !selectedBatch ||
        String(result.batch_id) === String(selectedBatch);

      const matchesTest =
        !selectedTest ||
        String(result.test_id) === String(selectedTest);

      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        String(result.student_id).includes(term) ||
        getStudentName(result.student_id).toLowerCase().includes(term) ||
        String(result.test_id).includes(term);

      return matchesBatch && matchesTest && matchesSearch;
    });
  }, [results, selectedBatch, selectedTest, search, students]);

  function handleTestChange(e) {
    const { name, value } = e.target;
    setTestForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleResultChange(e) {
    const { name, value } = e.target;

    setResultForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "Batch_id"
        ? { Test_id: "", Student_id: "" }
        : {}),
    }));
  }

  async function submitTest(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      Test_id: Number(testForm.Test_id),
      Batch_id: Number(testForm.Batch_id),
      Test_title: testForm.Test_title.trim(),
      Date: testForm.Date || null,
      Question_paper_Link: testForm.Question_paper_Link.trim() || null,
      Answerkey_Link: testForm.Answerkey_Link.trim() || null,
    };

    try {
      if (editingTest) {
        await testApi.update(
          editingTest.test_id,
          editingTest.batch_id,
          payload
        );
        setSuccess("Test updated successfully.");
      } else {
        await testApi.create(payload);
        setSuccess("Test created successfully.");
      }

      resetTestForm();
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save test."
      );
    } finally {
      setSaving(false);
    }
  }

  function editTest(test) {
    setEditingTest({
      test_id: test.test_id,
      batch_id: test.batch_id,
    });

    setTestForm({
      Test_id: test.test_id,
      Batch_id: test.batch_id,
      Test_title: test.test_title || "",
      Date: test.date || "",
      Question_paper_Link: test.question_paper_Link || "",
      Answerkey_Link: test.answerkey_Link || "",
    });

    setActiveTab("tests");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetTestForm() {
    setEditingTest(null);
    setTestForm(emptyTest);
  }

  async function deleteTest(test) {
    const hasResults = results.some(
      (result) =>
        String(result.test_id) === String(test.test_id) &&
        String(result.batch_id) === String(test.batch_id)
    );

    const warning = hasResults
      ? "Deleting this test will also delete its results because of the database cascade. Continue?"
      : "Delete this test?";

    if (!window.confirm(warning)) return;

    setError("");
    setSuccess("");

    try {
      await testApi.delete(test.test_id, test.batch_id);
      setSuccess("Test deleted successfully.");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete test."
      );
    }
  }

  async function submitResult(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      Student_id: Number(resultForm.Student_id),
      Batch_id: Number(resultForm.Batch_id),
      Test_id: Number(resultForm.Test_id),
      Score: resultForm.Score === "" ? null : Number(resultForm.Score),
    };

    try {
      if (editingResult) {
        await takesApi.update(
          editingResult.student_id,
          editingResult.batch_id,
          editingResult.test_id,
          payload
        );
        setSuccess("Result updated successfully.");
      } else {
        await takesApi.create(payload);
        setSuccess("Result recorded successfully.");
      }

      resetResultForm();
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save result."
      );
    } finally {
      setSaving(false);
    }
  }

  function editResult(result) {
    setEditingResult({
      student_id: result.student_id,
      batch_id: result.batch_id,
      test_id: result.test_id,
    });

    setResultForm({
      Student_id: result.student_id,
      Batch_id: result.batch_id,
      Test_id: result.test_id,
      Score: result.score ?? "",
    });

    setActiveTab("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetResultForm() {
    setEditingResult(null);
    setResultForm(emptyResult);
  }

  async function deleteResult(result) {
    if (!window.confirm("Delete this result?")) return;

    setError("");
    setSuccess("");

    try {
      await takesApi.delete(
        result.student_id,
        result.batch_id,
        result.test_id
      );
      setSuccess("Result deleted successfully.");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete result."
      );
    }
  }

  if (loading) {
    return (
      <div className="container py-4 text-center">
        Loading tests and results...
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Tests & Results</h2>
          <p className="text-muted mb-0">
            Manage batch tests and student scores.
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={loadData}
          disabled={saving}
        >
          <i className="bi bi-arrow-clockwise me-2" />
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "tests" ? "active" : ""}`}
            onClick={() => setActiveTab("tests")}
          >
            Tests
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "results" ? "active" : ""}`}
            onClick={() => setActiveTab("results")}
          >
            Results
          </button>
        </li>
      </ul>

      {activeTab === "tests" && (
        <>
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                {editingTest ? "Edit Test" : "Create Test"}
              </h5>
            </div>

            <div className="card-body">
              <form onSubmit={submitTest}>
                <div className="row g-3">
                  <div className="col-md-2">
                    <label className="form-label">Test ID</label>
                    <input
                      type="number"
                      className="form-control"
                      name="Test_id"
                      value={testForm.Test_id}
                      onChange={handleTestChange}
                      disabled={!!editingTest}
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Batch</label>
                    <select
                      className="form-select"
                      name="Batch_id"
                      value={testForm.Batch_id}
                      onChange={handleTestChange}
                      disabled={!!editingTest}
                      required
                    >
                      <option value="">Select batch</option>
                      {batches.map((batch) => (
                        <option key={batch.batch_id} value={batch.batch_id}>
                          Batch {batch.batch_id}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Test Title</label>
                    <input
                      type="text"
                      maxLength="255"
                      className="form-control"
                      name="Test_title"
                      value={testForm.Test_title}
                      onChange={handleTestChange}
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="Date"
                      value={testForm.Date}
                      onChange={handleTestChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Question Paper Link</label>
                    <input
                      type="url"
                      maxLength="500"
                      className="form-control"
                      name="Question_paper_Link"
                      value={testForm.Question_paper_Link}
                      onChange={handleTestChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Answer Key Link</label>
                    <input
                      type="url"
                      maxLength="500"
                      className="form-control"
                      name="Answerkey_Link"
                      value={testForm.Answerkey_Link}
                      onChange={handleTestChange}
                    />
                  </div>
                </div>

                <div className="mt-3 d-flex gap-2">
                  <button className="btn btn-primary" disabled={saving}>
                    {editingTest ? "Update Test" : "Create Test"}
                  </button>
                  {editingTest && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={resetTestForm}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Test Records</h5>
            </div>

            <div className="card-body border-bottom">
              <div className="row g-2">
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={selectedBatch}
                    onChange={(e) => {
                      setSelectedBatch(e.target.value);
                      setSelectedTest("");
                    }}
                  >
                    <option value="">All batches</option>
                    {batches.map((batch) => (
                      <option key={batch.batch_id} value={batch.batch_id}>
                        Batch {batch.batch_id}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-8">
                  <input
                    className="form-control"
                    placeholder="Search by test ID or title"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Test ID</th>
                    <th>Batch</th>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Question Paper</th>
                    <th>Answer Key</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.map((test) => (
                    <tr key={`${test.test_id}-${test.batch_id}`}>
                      <td>{test.test_id}</td>
                      <td>{test.batch_id}</td>
                      <td>{test.test_title}</td>
                      <td>{test.date || "—"}</td>
                      <td>
                        {test.question_paper_Link ? (
                          <a
                            href={test.question_paper_Link}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open
                          </a>
                        ) : "—"}
                      </td>
                      <td>
                        {test.answerkey_Link ? (
                          <a
                            href={test.answerkey_Link}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open
                          </a>
                        ) : "—"}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => editTest(test)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteTest(test)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTests.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        No tests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "results" && (
        <>
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                {editingResult ? "Edit Result" : "Record Result"}
              </h5>
            </div>

            <div className="card-body">
              <form onSubmit={submitResult}>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label">Batch</label>
                    <select
                      className="form-select"
                      name="Batch_id"
                      value={resultForm.Batch_id}
                      onChange={handleResultChange}
                      disabled={!!editingResult}
                      required
                    >
                      <option value="">Select batch</option>
                      {batches.map((batch) => (
                        <option key={batch.batch_id} value={batch.batch_id}>
                          Batch {batch.batch_id}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Test</label>
                    <select
                      className="form-select"
                      name="Test_id"
                      value={resultForm.Test_id}
                      onChange={handleResultChange}
                      disabled={!!editingResult || !resultForm.Batch_id}
                      required
                    >
                      <option value="">Select test</option>
                      {batchTests.map((test) => (
                        <option
                          key={`${test.test_id}-${test.batch_id}`}
                          value={test.test_id}
                        >
                          {test.test_id} — {test.test_title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Student</label>
                    <select
                      className="form-select"
                      name="Student_id"
                      value={resultForm.Student_id}
                      onChange={handleResultChange}
                      disabled={!!editingResult || !resultForm.Batch_id}
                      required
                    >
                      <option value="">Select student</option>
                      {enrolledStudents.map((student) => (
                        <option
                          key={student.student_id}
                          value={student.student_id}
                        >
                          {student.student_id} — {getStudentName(student.student_id)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-2">
                    <label className="form-label">Score</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      name="Score"
                      value={resultForm.Score}
                      onChange={handleResultChange}
                      required
                    />
                  </div>
                </div>

                <div className="mt-3 d-flex gap-2">
                  <button className="btn btn-primary" disabled={saving}>
                    {editingResult ? "Update Result" : "Save Result"}
                  </button>
                  {editingResult && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={resetResultForm}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Student Results</h5>
            </div>

            <div className="card-body border-bottom">
              <div className="row g-2">
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={selectedBatch}
                    onChange={(e) => {
                      setSelectedBatch(e.target.value);
                      setSelectedTest("");
                    }}
                  >
                    <option value="">All batches</option>
                    {batches.map((batch) => (
                      <option key={batch.batch_id} value={batch.batch_id}>
                        Batch {batch.batch_id}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={selectedTest}
                    onChange={(e) => setSelectedTest(e.target.value)}
                  >
                    <option value="">All tests</option>
                    {tests
                      .filter(
                        (test) =>
                          !selectedBatch ||
                          String(test.batch_id) === String(selectedBatch)
                      )
                      .map((test) => (
                        <option
                          key={`${test.test_id}-${test.batch_id}`}
                          value={test.test_id}
                        >
                          Batch {test.batch_id}: {test.test_title}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <input
                    className="form-control"
                    placeholder="Search student or test"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Student ID</th>
                    <th>Student</th>
                    <th>Batch</th>
                    <th>Test</th>
                    <th>Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => (
                    <tr
                      key={`${result.student_id}-${result.batch_id}-${result.test_id}`}
                    >
                      <td>{result.student_id}</td>
                      <td>{getStudentName(result.student_id)}</td>
                      <td>{result.batch_id}</td>
                      <td>
                        {getTestTitle(result.test_id, result.batch_id)}
                      </td>
                      <td>{result.score ?? "—"}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => editResult(result)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteResult(result)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredResults.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        No results found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}