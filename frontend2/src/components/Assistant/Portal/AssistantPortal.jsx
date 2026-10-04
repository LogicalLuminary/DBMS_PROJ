import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
// Assuming getAssistantSalaryRecords is in apiService
import { getTeacherSalaryRecords } from '../../../api/apiService'; // Reusing logic for demonstration
import './AssistantPortal.css';

const AssistantPortal = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('salary');
  const [salaries, setSalaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        // In reality, this would be an API call specifically for the assistant's salary
        // e.g., await getAssistantSalaryRecords(user.id);
        setSalaries([
          { Receipt_id: 'AST-REC-501', Month: 10, Year: 2023, Amount: 35000, Salary_payment_date: '2023-10-31' },
          { Receipt_id: 'AST-REC-490', Month: 9, Year: 2023, Amount: 35000, Salary_payment_date: '2023-09-30' }
        ]);
      } catch (error) {
        console.error("Failed to load portal data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPortalData();
  }, [user.id]);

  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  if (isLoading) return <div className="loader-wrapper"><div className="spinner"></div></div>;

  return (
    <div className="assistant-portal-container">
      <div className="page-header">
        <h2>My Staff Portal</h2>
        <p>Review your personal attendance records and salary disbursements.</p>
      </div>

      <div className="type-toggle">
        <button 
          className={`toggle-btn ${activeTab === 'salary' ? 'active' : ''}`}
          onClick={() => setActiveTab('salary')}
        >
          Salary Records
        </button>
        <button 
          className={`toggle-btn ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          Attendance Log
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'salary' && (
          <div className="salary-grid">
            {salaries.map((record, index) => (
              <div key={index} className="salary-card">
                <div className="salary-card-header">
                  <h3>{getMonthName(record.Month)} {record.Year}</h3>
                  <span className="amount-badge">₹{record.Amount.toLocaleString()}</span>
                </div>
                <div className="salary-details">
                  <p><strong>Payment Date:</strong> {record.Salary_payment_date}</p>
                  <p><strong>Reference No:</strong> {record.Receipt_id}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="info-card">
            <h3>Recent Attendance</h3>
            <div className="empty-state">
              <p>Your daily attendance logs will appear here. (Integration pending HR module)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantPortal;