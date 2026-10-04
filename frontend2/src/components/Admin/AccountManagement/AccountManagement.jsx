import React, { useState, useEffect } from 'react';
import { getAllStudents, getAllTeachers, deleteUser } from '../../../api/apiService';
import './AccountManagement.css';
import { ROLES } from '../../../utils/constants';

const AccountManagement = () => {
  const [targetRole, setTargetRole] = useState(ROLES.STUDENT);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch users whenever the selected role tab changes
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setMessage({ type: '', text: '' });
      setSelectedUserId('');
      try {
        let data = [];
        if (targetRole === ROLES.STUDENT) {
          data = await getAllStudents();
        } else if (targetRole === ROLES.TEACHER) {
          data = await getAllTeachers();
        }
        // If you have an assistant fetch endpoint, add it here
        setUsers(data || []);
      } catch (err) {
        setMessage({ type: 'error', text: `Failed to load ${targetRole}s.` });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [targetRole]);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    // Professional safety check
    const isConfirmed = window.confirm(
      `CRITICAL WARNING: Are you sure you want to permanently delete this ${targetRole}? This action cannot be undone and will cascade to their attendance and records.`
    );
    
    if (!isConfirmed) return;

    setIsDeleting(true);
    setMessage({ type: '', text: '' });

    try {
      await deleteUser(targetRole, selectedUserId);
      setMessage({ type: 'success', text: `${targetRole.charAt(0).toUpperCase() + targetRole.slice(1)} account deleted successfully.` });
      
      // Remove deleted user from the local state dropdown
      setUsers(users.filter(u => 
        (u.Student_id || u.Teacher_id || u.Assistant_id)?.toString() !== selectedUserId
      ));
      setSelectedUserId('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete account.' });
    } finally {
      setIsSubmitting(false);
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-management-container">
      <div className="page-header danger-header">
        <h2>System Account Management</h2>
        <p>Permanently remove user accounts from the database. Exercise extreme caution.</p>
      </div>

      <div className="type-toggle">
        <button 
          className={`toggle-btn ${targetRole === ROLES.STUDENT ? 'active' : ''}`}
          onClick={() => setTargetRole(ROLES.STUDENT)}
        >
          Students
        </button>
        <button 
          className={`toggle-btn ${targetRole === ROLES.TEACHER ? 'active' : ''}`}
          onClick={() => setTargetRole(ROLES.TEACHER)}
        >
          Teachers
        </button>
      </div>

      {message.text && <div className={`alert-banner ${message.type}`}>{message.text}</div>}

      <div className="danger-zone-card">
        <h3>Delete {targetRole.charAt(0).toUpperCase() + targetRole.slice(1)}</h3>
        <form onSubmit={handleDelete} className="admin-form">
          <div className="input-group">
            <label>Select User to Delete *</label>
            {isLoading ? (
              <p className="loading-text">Loading users...</p>
            ) : (
              <select 
                value={selectedUserId} 
                onChange={(e) => setSelectedUserId(e.target.value)} 
                required
              >
                <option value="">-- Choose Account --</option>
                {users.map(user => {
                  // Dynamically handle different ID names based on backend schema
                  const id = user.Student_id || user.Teacher_id || user.Assistant_id;
                  return (
                    <option key={id} value={id}>
                      {user.First_name} {user.Last_name} ({user.Email})
                    </option>
                  );
                })}
              </select>
            )}
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="delete-btn" 
              disabled={isDeleting || !selectedUserId || isLoading}
            >
              {isDeleting ? <span className="btn-spinner"></span> : 'Permanently Delete Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountManagement;