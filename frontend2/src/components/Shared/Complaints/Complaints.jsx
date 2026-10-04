import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getComplaints, addComplaint, getAllSystemComplaints } from '../../../api/apiService';
import { ROLES } from '../../../utils/constants';
import './Complaints.css';

const Complaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New Complaint Form State
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === ROLES.ADMIN;

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const fetchComplaints = async () => {
    setIsLoading(true);
    setError('');
    try {
      let data;
      if (isAdmin) {
        // Admin sees all complaints (custom endpoint or aggregated logic)
        data = await getAllSystemComplaints(); 
      } else {
        // Standard user sees their own complaints
        data = await getComplaints(user.role, user.id);
      }
      setComplaints(data || []);
    } catch (err) {
      setError('Unable to load complaints. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComplaint = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    setIsSubmitting(true);
    try {
      const currentDateTime = new Date();
      const complaintData = {
        [`${user.role.charAt(0).toUpperCase() + user.role.slice(1)}_id`]: user.id, // Dynamically set Student_id, Teacher_id, etc.
        Title: newTitle,
        Complaint_description: newDescription,
        Complaint_date: currentDateTime.toISOString().split('T')[0],
        Complaint_time: currentDateTime.toTimeString().split(' ')[0]
      };

      await addComplaint(user.role, complaintData);
      
      // Reset form and refresh list
      setShowForm(false);
      setNewTitle('');
      setNewDescription('');
      fetchComplaints();
    } catch (err) {
      setError('Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="complaints-container loader-wrapper">
        <div className="spinner"></div>
        <p>Loading complaints...</p>
      </div>
    );
  }

  return (
    <div className="complaints-container">
      <div className="complaints-header">
        <div>
          <h2>{isAdmin ? 'System Complaints' : 'My Complaints'}</h2>
          <p>{isAdmin ? 'Overview of all user issues and feedback.' : 'Track and manage your submitted issues.'}</p>
        </div>
        {!isAdmin && (
          <button 
            className="action-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ New Complaint'}
          </button>
        )}
      </div>

      {error && <div className="alert-banner error">{error}</div>}

      {/* New Complaint Form */}
      {showForm && !isAdmin && (
        <div className="complaint-form-card">
          <h3>Submit a New Issue</h3>
          <form onSubmit={handleAddComplaint} className="info-form">
            <div className="input-group">
              <label>Subject / Title</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Brief summary of the issue"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea 
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Provide detailed information..."
                rows="4"
                required
                disabled={isSubmitting}
              ></textarea>
            </div>
            <button type="submit" className="save-btn" disabled={isSubmitting}>
              {isSubmitting ? <span className="btn-spinner"></span> : 'Submit Complaint'}
            </button>
          </form>
        </div>
      )}

      {/* Complaints List */}
      <div className="complaints-list">
        {complaints.length === 0 ? (
          <div className="empty-state">
            <p>No complaints found.</p>
          </div>
        ) : (
          <div className="complaints-grid">
            {complaints.map((comp, index) => (
              <div key={index} className="complaint-card">
                <div className="complaint-card-header">
                  <h4>{comp.Title}</h4>
                  <span className="complaint-date">{comp.Complaint_date}</span>
                </div>
                <p className="complaint-desc">{comp.Complaint_description}</p>
                
                {/* Admin extra info to show who made the complaint */}
                {isAdmin && comp.Submitter_Name && (
                  <div className="complaint-footer">
                    <small>Submitted by: {comp.Submitter_Name} ({comp.Role})</small>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Complaints;