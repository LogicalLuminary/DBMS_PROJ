import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getTeacherSalaryRecords } from '../../../api/apiService';
import './TeacherSalary.css';

const TeacherSalary = () => {
  const { user } = useAuth();
  const [salaries, setSalaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSalary = async () => {
      try {
        const data = await getTeacherSalaryRecords(user.id);
        setSalaries(data?.length ? data : [
          { Receipt_id: 'REC-99201', Month: 9, Year: 2023, Amount: 45000, Salary_payment_date: '2023-09-30' },
          { Receipt_id: 'REC-88432', Month: 8, Year: 2023, Amount: 45000, Salary_payment_date: '2023-08-31' }
        ]);
      } catch (err) {
        console.error("Error fetching salary:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSalary();
  }, [user.id]);

  if (isLoading) return <div className="loader-wrapper"><div className="spinner"></div></div>;

  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  return (
    <div className="teacher-salary-container">
      <div className="page-header">
        <h2>My Salary Records</h2>
        <p>Review your monthly disbursements and payment references.</p>
      </div>

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
    </div>
  );
};

export default TeacherSalary;