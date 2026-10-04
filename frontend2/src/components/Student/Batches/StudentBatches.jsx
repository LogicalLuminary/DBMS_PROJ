import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getStudentBatches } from '../../../api/apiService';
import './StudentBatches.css';

const StudentBatches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        // Assuming user.id corresponds to Student_id
        const data = await getStudentBatches(user.id);
        // Mocking data structure based on expected backend join (Enrollment + Batch + Course)
        setBatches(data || []);
      } catch (err) {
        setError('Unable to load your enrolled batches at this time.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBatches();
  }, [user]);

  if (isLoading) {
    return (
      <div className="batches-container loader-wrapper">
        <div className="spinner"></div>
        <p>Loading your batches...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert-banner error">{error}</div>;
  }

  return (
    <div className="batches-container">
      <div className="page-header">
        <h2>My Enrolled Batches</h2>
        <p>Select a batch to view materials, attendance, and progress.</p>
      </div>

      {batches.length === 0 ? (
        <div className="empty-state">
          <p>You are not enrolled in any active batches.</p>
        </div>
      ) : (
        <div className="batch-grid">
          {batches.map((enrollment, index) => (
            <div 
              key={index} 
              className="batch-card"
              onClick={() => navigate(`/student/batches/${enrollment.Batch_id}`)}
            >
              <div className="batch-card-header">
                <h3>{enrollment.Course_Name || 'Course Name'}</h3>
                <span className={`status-badge ${enrollment.Status === 'Active' ? 'active' : 'completed'}`}>
                  {enrollment.Status || 'Active'}
                </span>
              </div>
              <div className="batch-details">
                <p><strong>Venue:</strong> {enrollment.Venue || 'Online'}</p>
                <p><strong>Start Date:</strong> {enrollment.Start_date}</p>
                <p><strong>Timing:</strong> {enrollment.Start_time} - {enrollment.End_time}</p>
              </div>
              <div className="batch-progress">
                <div className="progress-bar">
                  {/* Mock progress calculation */}
                  <div className="progress-fill" style={{ width: `${(enrollment.Modules_Completed / enrollment.Total_Modules) * 100 || 0}%` }}></div>
                </div>
                <small>{enrollment.Modules_Completed || 0} Modules Completed</small>
              </div>
              <button className="view-details-btn">View Batch Dashboard &rarr;</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentBatches;