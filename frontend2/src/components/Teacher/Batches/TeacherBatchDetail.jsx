import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
// Assuming these will be in the final apiService: createBatchNotification, markStudentAttendance, createTest, gradeStudent
import { createBatchNotification, markStudentAttendance } from '../../../api/apiService';
import './TeacherBatches.css';

const TeacherBatchDetail = () => {
  const { batchId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tests'); // Defaulting to tests for demonstration
  
  // Notification State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifDesc, setNotifDesc] = useState('');
  
  // Mock Students for Attendance & Grading
  const [students, setStudents] = useState([
    { Student_id: 1, Name: 'Alex Johnson', Status: 1 },
    { Student_id: 2, Name: 'Maria Garcia', Status: 1 },
  ]);

  // --- NEW: Test & Scoring State ---
  const [tests, setTests] = useState([
    { Test_id: 1, Test_title: 'Midterm Exam', Date: '2023-10-15', Question_paper_Link: '#', Answerkey_Link: '#' }
  ]);
  const [showTestForm, setShowTestForm] = useState(false);
  const [newTest, setNewTest] = useState({ Test_title: '', Date: '', Question_paper_Link: '', Answerkey_Link: '' });
  
  // Grading State
  const [selectedTestToGrade, setSelectedTestToGrade] = useState(null);
  const [scores, setScores] = useState({}); // { studentId: score }

  const handlePostNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle || !notifDesc) return;
    try {
      await createBatchNotification({ Batch_id: batchId, Title: notifTitle, Description: notifDesc });
      alert('Notification posted successfully!');
      setNotifTitle(''); setNotifDesc('');
    } catch (err) {
      alert('Failed to post notification.');
    }
  };

  const handleSaveAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const payload = students.map(s => ({ Date: today, Student_id: s.Student_id, Batch_id: batchId, Status: s.Status }));
      await markStudentAttendance(payload[0]); 
      alert('Attendance saved successfully!');
    } catch (err) {
      alert('Failed to save attendance.');
    }
  };

  const toggleAttendance = (id) => {
    setStudents(students.map(s => s.Student_id === id ? { ...s, Status: s.Status === 1 ? 0 : 1 } : s));
  };

  // --- NEW: Test Handlers ---
  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      // API call would go here: await createTest({ ...newTest, Batch_id: batchId })
      const createdTest = { ...newTest, Test_id: Date.now() }; // Mocking DB generation
      setTests([...tests, createdTest]);
      setShowTestForm(false);
      setNewTest({ Test_title: '', Date: '', Question_paper_Link: '', Answerkey_Link: '' });
      alert('Test created successfully!');
    } catch (err) {
      alert('Failed to create test.');
    }
  };

  const handleScoreChange = (studentId, value) => {
    setScores(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSaveGrades = async () => {
    try {
      // In reality, map through scores and send to the `Takes` table via API
      console.log('Saving scores for Test', selectedTestToGrade.Test_id, scores);
      alert('Grades saved successfully!');
      setSelectedTestToGrade(null);
    } catch (err) {
      alert('Failed to save grades.');
    }
  };

  return (
    <div className="teacher-batch-detail">
      <button className="back-link" onClick={() => navigate('/teacher/batches')}>&larr; Back to Batches</button>
      
      <div className="batch-header-banner">
        <h2>Batch Workspace</h2>
        <p>Manage ID: {batchId}</p>
      </div>

      <div className="tabs-container">
        {['attendance', 'tests', 'notifications'].map((tab) => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'attendance' && (
          <div className="attendance-section">
            <div className="section-header">
              <h3>Mark Today's Attendance</h3>
              <button className="save-btn small" onClick={handleSaveAttendance}>Save Register</button>
            </div>
            <div className="student-list">
              {students.map(student => (
                <div key={student.Student_id} className="student-row">
                  <span>{student.Name}</span>
                  <button 
                    className={`status-toggle ${student.Status === 1 ? 'present' : 'absent'}`}
                    onClick={() => toggleAttendance(student.Student_id)}
                  >
                    {student.Status === 1 ? 'Present' : 'Absent'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="form-card">
            <h3>Post New Notification</h3>
            <p className="help-text">Note: Notifications cannot be deleted once posted.</p>
            <form onSubmit={handlePostNotification} className="info-form">
              <div className="input-group">
                <label>Title</label>
                <input type="text" value={notifTitle} onChange={e => setNotifTitle(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea value={notifDesc} onChange={e => setNotifDesc(e.target.value)} required rows="3"></textarea>
              </div>
              <button type="submit" className="save-btn">Post Notification</button>
            </form>
          </div>
        )}

        {/* --- NEW: Tests & Scoring View --- */}
        {activeTab === 'tests' && (
          <div className="tests-section">
            {!selectedTestToGrade ? (
              <>
                <div className="section-header">
                  <h3>Batch Assessments</h3>
                  <button className="save-btn small" onClick={() => setShowTestForm(!showTestForm)}>
                    {showTestForm ? 'Cancel' : '+ Create Test'}
                  </button>
                </div>

                {showTestForm && (
                  <div className="form-card" style={{ marginBottom: '2rem' }}>
                    <h3>New Assessment Details</h3>
                    <form onSubmit={handleCreateTest} className="info-form">
                      <div className="form-grid">
                        <div className="input-group">
                          <label>Test Title *</label>
                          <input type="text" value={newTest.Test_title} onChange={e => setNewTest({...newTest, Test_title: e.target.value})} required />
                        </div>
                        <div className="input-group">
                          <label>Date *</label>
                          <input type="date" value={newTest.Date} onChange={e => setNewTest({...newTest, Date: e.target.value})} required />
                        </div>
                        <div className="input-group">
                          <label>Question Paper Link</label>
                          <input type="url" value={newTest.Question_paper_Link} onChange={e => setNewTest({...newTest, Question_paper_Link: e.target.value})} placeholder="https://..." />
                        </div>
                        <div className="input-group">
                          <label>Answer Key Link</label>
                          <input type="url" value={newTest.Answerkey_Link} onChange={e => setNewTest({...newTest, Answerkey_Link: e.target.value})} placeholder="https://..." />
                        </div>
                      </div>
                      <button type="submit" className="save-btn" style={{ marginTop: '1rem' }}>Create Test</button>
                    </form>
                  </div>
                )}

                <div className="list-section">
                  {tests.map(test => (
                    <div key={test.Test_id} className="list-item flex-between">
                      <div>
                        <h4>{test.Test_title}</h4>
                        <small>Date: {test.Date}</small>
                      </div>
                      <button 
                        className="view-details-btn" 
                        style={{ width: 'auto', padding: '0.5rem 1rem' }}
                        onClick={() => setSelectedTestToGrade(test)}
                      >
                        Grade Students &rarr;
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="grading-panel">
                <div className="section-header">
                  <div>
                    <button className="back-link" onClick={() => setSelectedTestToGrade(null)}>&larr; Back to Tests</button>
                    <h3>Grading: {selectedTestToGrade.Test_title}</h3>
                  </div>
                  <button className="save-btn small" onClick={handleSaveGrades}>Submit Grades</button>
                </div>
                
                <div className="student-list">
                  {students.map(student => (
                    <div key={student.Student_id} className="student-row">
                      <span>{student.Name}</span>
                      <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ margin: 0 }}>Score:</label>
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          step="0.01"
                          style={{ width: '100px', padding: '0.4rem' }}
                          value={scores[student.Student_id] || ''}
                          onChange={(e) => handleScoreChange(student.Student_id, e.target.value)}
                          placeholder="/ 100"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherBatchDetail;