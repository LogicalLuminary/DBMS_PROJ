import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getBatchDetailsForStudent } from '../../../api/apiService';
import './StudentBatches.css';

const StudentBatchDetail = () => {
  const { batchId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [batchData, setBatchData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBatchDetails = async () => {
      try {
        const data = await getBatchDetailsForStudent(user.id, batchId);
        // Mock fallback if endpoint isn't fully returning aggregated data yet
        setBatchData(data || {
          courseName: 'Advanced Web Development',
          venue: 'Room 101',
          time: '10:00 AM - 12:00 PM',
          attendancePercent: 85,
          feeStatus: 'Paid',
          feeRef: 'FEE-90210',
          modules: [{ title: 'React Basics', desc: 'Hooks and State' }],
          tests: [{ title: 'Midterm', date: '2023-10-15', score: '88/100', link: '#' }],
          notifications: [{ title: 'Class Cancelled', date: '2023-10-12', desc: 'Rescheduled to tomorrow.' }]
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBatchDetails();
  }, [user.id, batchId]);

  if (isLoading) return <div className="loader-wrapper"><div className="spinner"></div></div>;

  return (
    <div className="batch-detail-container">
      <button className="back-link" onClick={() => navigate('/student/batches')}>
        &larr; Back to Batches
      </button>

      <div className="batch-header-banner">
        <h2>{batchData?.courseName}</h2>
        <div className="batch-meta-info">
          <span>📍 {batchData?.venue}</span>
          <span>⏰ {batchData?.time}</span>
        </div>
      </div>

      <div className="tabs-container">
        {['overview', 'modules', 'tests', 'attendance', 'fees'].map((tab) => (
          <button 
            key={tab} 
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <div className="info-card">
              <h3>Recent Notifications</h3>
              {batchData?.notifications?.map((notif, i) => (
                <div key={i} className="notif-item">
                  <strong>{notif.title}</strong>
                  <p>{notif.desc}</p>
                  <small>{notif.date}</small>
                </div>
              ))}
            </div>
            <div className="info-card">
              <h3>Quick Stats</h3>
              <p><strong>Attendance:</strong> {batchData?.attendancePercent}%</p>
              <p><strong>Fee Status:</strong> {batchData?.feeStatus}</p>
            </div>
          </div>
        )}

        {activeTab === 'modules' && (
          <div className="list-section">
            <h3>Course Modules</h3>
            {batchData?.modules?.map((mod, i) => (
              <div key={i} className="list-item">
                <h4>{mod.title}</h4>
                <p>{mod.desc}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="list-section">
            <h3>Test Results & Links</h3>
            {batchData?.tests?.map((test, i) => (
              <div key={i} className="list-item flex-between">
                <div>
                  <h4>{test.title}</h4>
                  <small>{test.date}</small>
                </div>
                <div className="test-actions">
                  <span className="score-badge">Score: {test.score}</span>
                  <a href={test.link} target="_blank" rel="noreferrer" className="action-link">View Paper</a>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="info-card fee-card">
            <h3>Fee Payment Details</h3>
            <div className="fee-details">
              <p><strong>Status:</strong> <span className="status-badge active">{batchData?.feeStatus}</span></p>
              <p><strong>Reference No:</strong> {batchData?.feeRef}</p>
              <small className="help-text">Contact the administration office for billing discrepancies.</small>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="info-card">
            <h3>Attendance Progress</h3>
            <div className="progress-large">
              <div className="progress-bar-large">
                <div className="progress-fill-large" style={{ width: `${batchData?.attendancePercent}%` }}></div>
              </div>
              <p className="progress-text">{batchData?.attendancePercent}% Overall Attendance</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentBatchDetail;