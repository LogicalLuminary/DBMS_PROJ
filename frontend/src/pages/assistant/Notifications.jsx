import { useEffect, useState } from "react";

import {
  getGlobalNotifications,
  createGlobalNotification,
  updateGlobalNotification,
  deleteGlobalNotification,
} from "../../api/globalNotificationApi";

import {
  getBatchNotifications,
  createBatchNotification,
  updateBatchNotification,
  deleteBatchNotification,
} from "../../api/batchNotificationApi";

import batchApi from "../../api/batchApi";

const emptyGlobal = {
  Notification_id: "",
  Assistant_id: "",
  Notification_date: "",
  Notification_time: "",
  Notification_title: "",
  Description: "",
};

const emptyBatch = {
  Notification_id: "",
  Batch_id: "",
  Title: "",
  Description: "",
};

export default function Notifications() {
  const [tab, setTab] = useState("global");

  const [globalNotifications, setGlobalNotifications] = useState([]);
  const [batchNotifications, setBatchNotifications] = useState([]);
  const [batches, setBatches] = useState([]);

  const [globalForm, setGlobalForm] = useState(emptyGlobal);
  const [batchForm, setBatchForm] = useState(emptyBatch);

  const [editingGlobal, setEditingGlobal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [globalData, batchData, batchList] =
        await Promise.all([
          getGlobalNotifications(),
          getBatchNotifications(),
          batchApi.getAll(),
        ]);

      setGlobalNotifications(globalData);
      setBatchNotifications(batchData);
      setBatches(batchList);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGlobalChange = (e) => {
    const { name, value } = e.target;

    setGlobalForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBatchChange = (e) => {
    const { name, value } = e.target;

    setBatchForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetGlobalForm = () => {
    setGlobalForm(emptyGlobal);
    setEditingGlobal(false);
  };

  const resetBatchForm = () => {
    setBatchForm(emptyBatch);
    setEditingBatch(false);
  };

  const handleGlobalSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      ...globalForm,
      Notification_id: Number(globalForm.Notification_id),
      Assistant_id: Number(globalForm.Assistant_id),
    };

    try {
      if (editingGlobal) {
        await updateGlobalNotification(
          payload.Notification_id,
          payload
        );
      } else {
        await createGlobalNotification(payload);
      }

      resetGlobalForm();
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save global notification."
      );
    }
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      ...batchForm,
      Notification_id: Number(batchForm.Notification_id),
      Batch_id: Number(batchForm.Batch_id),
    };

    try {
      if (editingBatch) {
        await updateBatchNotification(
          payload.Notification_id,
          payload.Batch_id,
          payload
        );
      } else {
        await createBatchNotification(payload);
      }

      resetBatchForm();
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save batch notification."
      );
    }
  };

  const editGlobal = (notification) => {
    setGlobalForm({
      ...notification,

      Notification_date:
        notification.notification_date ??
        notification.Notification_date ??
        "",

      Notification_time:
        notification.notification_time ??
        notification.Notification_time ??
        "",

      Notification_id:
        notification.notification_id ??
        notification.Notification_id,

      Assistant_id:
        notification.assistant_id ??
        notification.Assistant_id,

      Notification_title:
        notification.notification_title ??
        notification.Notification_title ??
        "",

      Description:
        notification.description ??
        notification.Description ??
        "",
    });

    setEditingGlobal(true);
  };

  const editBatch = (notification) => {
    setBatchForm({
      Notification_id:
        notification.notification_id ??
        notification.Notification_id,

      Batch_id:
        notification.batch_id ??
        notification.Batch_id,

      Title:
        notification.title ??
        notification.Title ??
        "",

      Description:
        notification.description ??
        notification.Description ??
        "",
    });

    setEditingBatch(true);
  };

  const handleGlobalDelete = async (notification) => {
    const id =
      notification.notification_id ??
      notification.Notification_id;

    if (!window.confirm(`Delete global notification ${id}?`)) {
      return;
    }

    setError("");

    try {
      await deleteGlobalNotification(id);
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete global notification."
      );
    }
  };

  const handleBatchDelete = async (notification) => {
    const notificationId =
      notification.notification_id ??
      notification.Notification_id;

    const batchId =
      notification.batch_id ??
      notification.Batch_id;

    if (
      !window.confirm(
        `Delete notification ${notificationId} for batch ${batchId}?`
      )
    ) {
      return;
    }

    setError("");

    try {
      await deleteBatchNotification(
        notificationId,
        batchId
      );

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete batch notification."
      );
    }
  };

  if (loading) {
    return <p>Loading notifications...</p>;
  }

  return (
    <div className="container py-4">
      <h2>Notification Management</h2>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="btn-group my-3" role="group">
        <button
          className={`btn ${
            tab === "global"
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          onClick={() => setTab("global")}
        >
          Global Notifications
        </button>

        <button
          className={`btn ${
            tab === "batch"
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          onClick={() => setTab("batch")}
        >
          Batch Notifications
        </button>
      </div>

      {/* =========================
          GLOBAL NOTIFICATIONS
          ========================= */}
      {tab === "global" && (
        <>
          <h4>
            {editingGlobal
              ? "Edit Global Notification"
              : "Create Global Notification"}
          </h4>

          <form
            onSubmit={handleGlobalSubmit}
            className="card card-body mb-4"
          >
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">
                  Notification ID
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="Notification_id"
                  value={globalForm.Notification_id}
                  onChange={handleGlobalChange}
                  disabled={editingGlobal}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Assistant ID
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="Assistant_id"
                  value={globalForm.Assistant_id}
                  onChange={handleGlobalChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Date
                </label>

                <input
                  type="date"
                  className="form-control"
                  name="Notification_date"
                  value={globalForm.Notification_date}
                  onChange={handleGlobalChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Time
                </label>

                <input
                  type="time"
                  className="form-control"
                  name="Notification_time"
                  value={globalForm.Notification_time}
                  onChange={handleGlobalChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">
                  Title
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="Notification_title"
                  value={globalForm.Notification_title}
                  onChange={handleGlobalChange}
                  maxLength={255}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">
                  Description
                </label>

                <textarea
                  className="form-control"
                  name="Description"
                  value={globalForm.Description}
                  onChange={handleGlobalChange}
                  rows={3}
                  required
                />
              </div>
            </div>

            <div className="mt-3">
              <button className="btn btn-primary me-2">
                {editingGlobal ? "Update" : "Create"}
              </button>

              {editingGlobal && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetGlobalForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <h4>Global Notifications</h4>

          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Assistant ID</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {globalNotifications.map((n) => {
                  const id =
                    n.notification_id ??
                    n.Notification_id;

                  return (
                    <tr key={id}>
                      <td>{id}</td>

                      <td>
                        {n.assistant_id ??
                          n.Assistant_id}
                      </td>

                      <td>
                        {n.notification_date ??
                          n.Notification_date}
                      </td>

                      <td>
                        {n.notification_time ??
                          n.Notification_time}
                      </td>

                      <td>
                        {n.notification_title ??
                          n.Notification_title}
                      </td>

                      <td>
                        {n.description ??
                          n.Description}
                      </td>

                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => editGlobal(n)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            handleGlobalDelete(n)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {globalNotifications.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center"
                    >
                      No global notifications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* =========================
          BATCH NOTIFICATIONS
          ========================= */}
      {tab === "batch" && (
        <>
          <h4>
            {editingBatch
              ? "Edit Batch Notification"
              : "Create Batch Notification"}
          </h4>

          <form
            onSubmit={handleBatchSubmit}
            className="card card-body mb-4"
          >
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">
                  Notification ID
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="Notification_id"
                  value={batchForm.Notification_id}
                  onChange={handleBatchChange}
                  disabled={editingBatch}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Batch
                </label>

                <select
                  className="form-select"
                  name="Batch_id"
                  value={batchForm.Batch_id}
                  onChange={handleBatchChange}
                  disabled={editingBatch}
                  required
                >
                  <option value="">
                    Select batch
                  </option>

                  {batches.map((batch) => {
                    const id =
                      batch.batch_id ??
                      batch.Batch_id;

                    return (
                      <option key={id} value={id}>
                        {id}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">
                  Title
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="Title"
                  value={batchForm.Title}
                  onChange={handleBatchChange}
                  maxLength={255}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">
                  Description
                </label>

                <textarea
                  className="form-control"
                  name="Description"
                  value={batchForm.Description}
                  onChange={handleBatchChange}
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-3">
              <button className="btn btn-primary me-2">
                {editingBatch ? "Update" : "Create"}
              </button>

              {editingBatch && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetBatchForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <h4>Batch Notifications</h4>

          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>Notification ID</th>
                  <th>Batch ID</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {batchNotifications.map((n) => {
                  const notificationId =
                    n.notification_id ??
                    n.Notification_id;

                  const batchId =
                    n.batch_id ??
                    n.Batch_id;

                  return (
                    <tr
                      key={`${notificationId}-${batchId}`}
                    >
                      <td>{notificationId}</td>
                      <td>{batchId}</td>

                      <td>
                        {n.title ?? n.Title}
                      </td>

                      <td>
                        {n.description ??
                          n.Description}
                      </td>

                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() =>
                            editBatch(n)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            handleBatchDelete(n)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {batchNotifications.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center"
                    >
                      No batch notifications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// import { useEffect, useState } from "react";

// import {
//   getGlobalNotifications,
//   createGlobalNotification,
//   updateGlobalNotification,
//   deleteGlobalNotification,
// } from "../../api/globalNotificationApi";

// import {
//   getBatchNotifications,
//   createBatchNotification,
//   updateBatchNotification,
//   deleteBatchNotification,
// } from "../../api/batchNotificationApi";

// import { getBatches } from "../../api/batchApi";

// const emptyGlobal = {
//   Notification_id: "",
//   Assistant_id: "",
//   Notification_date: "",
//   Notification_time: "",
//   Notification_title: "",
//   Description: "",
// };

// const emptyBatch = {
//   Notification_id: "",
//   Batch_id: "",
//   Title: "",
//   Description: "",
// };

// export default function Notifications() {
//   const [tab, setTab] = useState("global");

//   const [globalNotifications, setGlobalNotifications] = useState([]);
//   const [batchNotifications, setBatchNotifications] = useState([]);
//   const [batches, setBatches] = useState([]);

//   const [globalForm, setGlobalForm] = useState(emptyGlobal);
//   const [batchForm, setBatchForm] = useState(emptyBatch);

//   const [editingGlobal, setEditingGlobal] = useState(false);
//   const [editingBatch, setEditingBatch] = useState(false);

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(true);

//   const loadData = async () => {
//     setLoading(true);
//     setError("");

//     try {
//       const [globalData, batchData, batchList] =
//         await Promise.all([
//           getGlobalNotifications(),
//           getBatchNotifications(),
//           getBatches(),
//         ]);

//       setGlobalNotifications(globalData);
//       setBatchNotifications(batchData);
//       setBatches(batchList);
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//           "Failed to load notifications."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   const handleGlobalChange = (e) => {
//     const { name, value } = e.target;

//     setGlobalForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleBatchChange = (e) => {
//     const { name, value } = e.target;

//     setBatchForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const resetGlobalForm = () => {
//     setGlobalForm(emptyGlobal);
//     setEditingGlobal(false);
//   };

//   const resetBatchForm = () => {
//     setBatchForm(emptyBatch);
//     setEditingBatch(false);
//   };

//   const handleGlobalSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     const payload = {
//       ...globalForm,
//       Notification_id: Number(globalForm.Notification_id),
//       Assistant_id: Number(globalForm.Assistant_id),
//     };

//     try {
//       if (editingGlobal) {
//         await updateGlobalNotification(
//           payload.Notification_id,
//           payload
//         );
//       } else {
//         await createGlobalNotification(payload);
//       }

//       resetGlobalForm();
//       await loadData();
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//           "Failed to save global notification."
//       );
//     }
//   };

//   const handleBatchSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     const payload = {
//       ...batchForm,
//       Notification_id: Number(batchForm.Notification_id),
//       Batch_id: Number(batchForm.Batch_id),
//     };

//     try {
//       if (editingBatch) {
//         await updateBatchNotification(
//           payload.Notification_id,
//           payload.Batch_id,
//           payload
//         );
//       } else {
//         await createBatchNotification(payload);
//       }

//       resetBatchForm();
//       await loadData();
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//           "Failed to save batch notification."
//       );
//     }
//   };

//   const editGlobal = (notification) => {
//     setGlobalForm({
//       ...notification,
//       Notification_date:
//         notification.notification_date ??
//         notification.Notification_date ??
//         "",
//       Notification_time:
//         notification.notification_time ??
//         notification.Notification_time ??
//         "",
//       Notification_id:
//         notification.notification_id ??
//         notification.Notification_id,
//       Assistant_id:
//         notification.assistant_id ??
//         notification.Assistant_id,
//       Notification_title:
//         notification.notification_title ??
//         notification.Notification_title ??
//         "",
//       Description:
//         notification.description ??
//         notification.Description ??
//         "",
//     });

//     setEditingGlobal(true);
//   };

//   const editBatch = (notification) => {
//     setBatchForm({
//       Notification_id:
//         notification.notification_id ??
//         notification.Notification_id,
//       Batch_id:
//         notification.batch_id ??
//         notification.Batch_id,
//       Title: notification.title ?? notification.Title ?? "",
//       Description:
//         notification.description ??
//         notification.Description ??
//         "",
//     });

//     setEditingBatch(true);
//   };

//   const handleGlobalDelete = async (notification) => {
//     const id =
//       notification.notification_id ??
//       notification.Notification_id;

//     if (
//       !window.confirm(
//         `Delete global notification ${id}?`
//       )
//     ) {
//       return;
//     }

//     setError("");

//     try {
//       await deleteGlobalNotification(id);
//       await loadData();
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//           "Failed to delete global notification."
//       );
//     }
//   };

//   const handleBatchDelete = async (notification) => {
//     const notificationId =
//       notification.notification_id ??
//       notification.Notification_id;

//     const batchId =
//       notification.batch_id ??
//       notification.Batch_id;

//     if (
//       !window.confirm(
//         `Delete notification ${notificationId} for batch ${batchId}?`
//       )
//     ) {
//       return;
//     }

//     setError("");

//     try {
//       await deleteBatchNotification(
//         notificationId,
//         batchId
//       );
//       await loadData();
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//           "Failed to delete batch notification."
//       );
//     }
//   };

//   if (loading) {
//     return <p>Loading notifications...</p>;
//   }

//   return (
//     <div className="container py-4">
//       <h2>Notification Management</h2>

//       {error && (
//         <div className="alert alert-danger">
//           {error}
//         </div>
//       )}

//       <div className="btn-group my-3" role="group">
//         <button
//           className={`btn ${
//             tab === "global"
//               ? "btn-primary"
//               : "btn-outline-primary"
//           }`}
//           onClick={() => setTab("global")}
//         >
//           Global Notifications
//         </button>

//         <button
//           className={`btn ${
//             tab === "batch"
//               ? "btn-primary"
//               : "btn-outline-primary"
//           }`}
//           onClick={() => setTab("batch")}
//         >
//           Batch Notifications
//         </button>
//       </div>

//       {tab === "global" && (
//         <>
//           <h4>
//             {editingGlobal
//               ? "Edit Global Notification"
//               : "Create Global Notification"}
//           </h4>

//           <form
//             onSubmit={handleGlobalSubmit}
//             className="card card-body mb-4"
//           >
//             <div className="row g-3">
//               <div className="col-md-6">
//                 <label className="form-label">
//                   Notification ID
//                 </label>
//                 <input
//                   type="number"
//                   className="form-control"
//                   name="Notification_id"
//                   value={globalForm.Notification_id}
//                   onChange={handleGlobalChange}
//                   disabled={editingGlobal}
//                   required
//                 />
//               </div>

//               <div className="col-md-6">
//                 <label className="form-label">
//                   Assistant ID
//                 </label>
//                 <input
//                   type="number"
//                   className="form-control"
//                   name="Assistant_id"
//                   value={globalForm.Assistant_id}
//                   onChange={handleGlobalChange}
//                   required
//                 />
//               </div>

//               <div className="col-md-6">
//                 <label className="form-label">
//                   Date
//                 </label>
//                 <input
//                   type="date"
//                   className="form-control"
//                   name="Notification_date"
//                   value={globalForm.Notification_date}
//                   onChange={handleGlobalChange}
//                   required
//                 />
//               </div>

//               <div className="col-md-6">
//                 <label className="form-label">
//                   Time
//                 </label>
//                 <input
//                   type="time"
//                   className="form-control"
//                   name="Notification_time"
//                   value={globalForm.Notification_time}
//                   onChange={handleGlobalChange}
//                   required
//                 />
//               </div>

//               <div className="col-12">
//                 <label className="form-label">
//                   Title
//                 </label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   name="Notification_title"
//                   value={globalForm.Notification_title}
//                   onChange={handleGlobalChange}
//                   maxLength={255}
//                   required
//                 />
//               </div>

//               <div className="col-12">
//                 <label className="form-label">
//                   Description
//                 </label>
//                 <textarea
//                   className="form-control"
//                   name="Description"
//                   value={globalForm.Description}
//                   onChange={handleGlobalChange}
//                   rows={3}
//                   required
//                 />
//               </div>
//             </div>

//             <div className="mt-3">
//               <button className="btn btn-primary me-2">
//                 {editingGlobal ? "Update" : "Create"}
//               </button>

//               {editingGlobal && (
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={resetGlobalForm}
//                 >
//                   Cancel
//                 </button>
//               )}
//             </div>
//           </form>

//           <h4>Global Notifications</h4>

//           <div className="table-responsive">
//             <table className="table table-bordered table-hover">
//               <thead>
//                 <tr>
//                   <th>ID</th>
//                   <th>Assistant ID</th>
//                   <th>Date</th>
//                   <th>Time</th>
//                   <th>Title</th>
//                   <th>Description</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {globalNotifications.map((n) => {
//                   const id =
//                     n.notification_id ?? n.Notification_id;

//                   return (
//                     <tr key={id}>
//                       <td>{id}</td>
//                       <td>
//                         {n.assistant_id ?? n.Assistant_id}
//                       </td>
//                       <td>
//                         {n.notification_date ??
//                           n.Notification_date}
//                       </td>
//                       <td>
//                         {n.notification_time ??
//                           n.Notification_time}
//                       </td>
//                       <td>
//                         {n.notification_title ??
//                           n.Notification_title}
//                       </td>
//                       <td>
//                         {n.description ?? n.Description}
//                       </td>
//                       <td>
//                         <button
//                           className="btn btn-sm btn-warning me-2"
//                           onClick={() => editGlobal(n)}
//                         >
//                           Edit
//                         </button>

//                         <button
//                           className="btn btn-sm btn-danger"
//                           onClick={() =>
//                             handleGlobalDelete(n)
//                           }
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}

//                 {globalNotifications.length === 0 && (
//                   <tr>
//                     <td colSpan="7" className="text-center">
//                       No global notifications found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}

//       {tab === "batch" && (
//         <>
//           <h4>
//             {editingBatch
//               ? "Edit Batch Notification"
//               : "Create Batch Notification"}
//           </h4>

//           <form
//             onSubmit={handleBatchSubmit}
//             className="card card-body mb-4"
//           >
//             <div className="row g-3">
//               <div className="col-md-6">
//                 <label className="form-label">
//                   Notification ID
//                 </label>
//                 <input
//                   type="number"
//                   className="form-control"
//                   name="Notification_id"
//                   value={batchForm.Notification_id}
//                   onChange={handleBatchChange}
//                   disabled={editingBatch}
//                   required
//                 />
//               </div>

//               <div className="col-md-6">
//                 <label className="form-label">
//                   Batch
//                 </label>
//                 <select
//                   className="form-select"
//                   name="Batch_id"
//                   value={batchForm.Batch_id}
//                   onChange={handleBatchChange}
//                   disabled={editingBatch}
//                   required
//                 >
//                   <option value="">Select batch</option>

//                   {batches.map((batch) => {
//                     const id =
//                       batch.batch_id ?? batch.Batch_id;

//                     return (
//                       <option key={id} value={id}>
//                         {id}
//                       </option>
//                     );
//                   })}
//                 </select>
//               </div>

//               <div className="col-12">
//                 <label className="form-label">
//                   Title
//                 </label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   name="Title"
//                   value={batchForm.Title}
//                   onChange={handleBatchChange}
//                   maxLength={255}
//                   required
//                 />
//               </div>

//               <div className="col-12">
//                 <label className="form-label">
//                   Description
//                 </label>
//                 <textarea
//                   className="form-control"
//                   name="Description"
//                   value={batchForm.Description}
//                   onChange={handleBatchChange}
//                   rows={3}
//                 />
//               </div>
//             </div>

//             <div className="mt-3">
//               <button className="btn btn-primary me-2">
//                 {editingBatch ? "Update" : "Create"}
//               </button>

//               {editingBatch && (
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={resetBatchForm}
//                 >
//                   Cancel
//                 </button>
//               )}
//             </div>
//           </form>

//           <h4>Batch Notifications</h4>

//           <div className="table-responsive">
//             <table className="table table-bordered table-hover">
//               <thead>
//                 <tr>
//                   <th>Notification ID</th>
//                   <th>Batch ID</th>
//                   <th>Title</th>
//                   <th>Description</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {batchNotifications.map((n) => {
//                   const notificationId =
//                     n.notification_id ??
//                     n.Notification_id;

//                   const batchId =
//                     n.batch_id ?? n.Batch_id;

//                   return (
//                     <tr
//                       key={`${notificationId}-${batchId}`}
//                     >
//                       <td>{notificationId}</td>
//                       <td>{batchId}</td>
//                       <td>{n.title ?? n.Title}</td>
//                       <td>
//                         {n.description ?? n.Description}
//                       </td>
//                       <td>
//                         <button
//                           className="btn btn-sm btn-warning me-2"
//                           onClick={() => editBatch(n)}
//                         >
//                           Edit
//                         </button>

//                         <button
//                           className="btn btn-sm btn-danger"
//                           onClick={() =>
//                             handleBatchDelete(n)
//                           }
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}

//                 {batchNotifications.length === 0 && (
//                   <tr>
//                     <td colSpan="5" className="text-center">
//                       No batch notifications found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }