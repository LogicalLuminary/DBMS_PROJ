import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getTeacherBatches } from '../../../api/apiService';
import './TeacherBatches.css';

const TeacherBatches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const data = await getTeacherBatches(user.id);
        // Fallback mock data if API is empty for testing UI
        setBatches(data?.length ? data : [
          { Batch_id: 101, Course_Name: 'Intro to React', Start_time: '10:00', End_time: '12:00', Venue: 'Lab 1', Modules_Completed: 3 }
        ]);
      } catch (err) {
        console.error("Failed to load batches:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBatches();
  }, [user.id]);

  if (isLoading) return <div className="loader-wrapper"><div className="spinner"></div></div>;

  return (
    <div className="teacher-batches-container">
      <div className="page-header">
        <h2>My Assigned Batches</h2>
        <p>Manage your classes, track attendance, and grade students.</p>
      </div>

      <div className="batch-grid">
        {batches.map((batch, index) => (
          <div key={index} className="batch-card" onClick={() => navigate(`/teacher/batches/${batch.Batch_id}`)}>
            <div className="batch-card-header">
              <h3>{batch.Course_Name || `Batch #${batch.Batch_id}`}</h3>
            </div>
            <div className="batch-details">
              <p><strong>Venue:</strong> {batch.Venue}</p>
              <p><strong>Timing:</strong> {batch.Start_time} - {batch.End_time}</p>
              <p><strong>Modules Completed:</strong> {batch.Modules_Completed}</p>
            </div>
            <button className="view-details-btn">Manage Batch &rarr;</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherBatches;