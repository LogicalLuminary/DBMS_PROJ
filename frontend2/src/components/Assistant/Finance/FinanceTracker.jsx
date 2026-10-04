import React, { useState, useEffect } from 'react';
import { getAllStudents, getAllBatches, getAllTeachers, addFeePayment, addSalaryRecord } from '../../../api/apiService';
import '../AssistantForms.css';

const FinanceTracker = () => {
  const [transactionType, setTransactionType] = useState('FEE'); // 'FEE' or 'SALARY'
  const [payeeRole, setPayeeRole] = useState('TEACHER'); // 'TEACHER' or 'ASSISTANT'
  
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    Amount: '',
    Date: new Date().toISOString().split('T')[0],
    // Fee specific
    Student_id: '',
    Batch_id: '',
    Mode_of_payment: 'Cash',
    // Salary specific
    Payee_id: '',
    Month: new Date().getMonth() + 1,
    Year: new Date().getFullYear(),
  });

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const [studentData, batchData, teacherData] = await Promise.all([
          getAllStudents(),
          getAllBatches(),
          getAllTeachers()
        ]);
        setStudents(studentData || []);
        setBatches(batchData || []);
        setTeachers(teacherData || []);
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load system records.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntities();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsSubmitting(true);

    try {
      if (transactionType === 'FEE') {
        // Backend expects Receipt_id generated physically or via DB trigger, we pass details
        await addFeePayment({
          Student_id: formData.Student_id,
          Batch_id: formData.Batch_id,
          Amount: formData.Amount,
          Payment_date: formData.Date,
          Payment_time: new Date().toTimeString().split(' ')[0],
          Mode_of_payment: formData.Mode_of_payment
        });
        setMessage({ type: 'success', text: 'Fee payment recorded successfully!' });
      } else {
        await addSalaryRecord(payeeRole, {
          [`${payeeRole.charAt(0).toUpperCase() + payeeRole.slice(1).toLowerCase()}_id`]: formData.Payee_id,
          Amount: formData.Amount,
          Salary_payment_date: formData.Date,
          Month: formData.Month,
          Year: formData.Year
        });
        setMessage({ type: 'success', text: 'Salary disbursement recorded successfully!' });
      }
      
      // Reset sensitive fields only
      setFormData({ ...formData, Amount: '', Student_id: '', Payee_id: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Transaction failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="loader-wrapper"><div className="spinner"></div></div>;

  return (
    <div className="assistant-form-container">
      <div className="page-header">
        <h2>Finance Tracker</h2>
        <p>Log physical fee collections and record salary disbursements.</p>
      </div>

      <div className="type-toggle">
        <button 
          className={`toggle-btn ${transactionType === 'FEE' ? 'active' : ''}`}
          onClick={() => { setTransactionType('FEE'); setMessage({ type: '', text: '' }); }}
        >
          Collect Fee
        </button>
        <button 
          className={`toggle-btn ${transactionType === 'SALARY' ? 'active' : ''}`}
          onClick={() => { setTransactionType('SALARY'); setMessage({ type: '', text: '' }); }}
        >
          Disburse Salary
        </button>
      </div>

      {message.text && <div className={`alert-banner ${message.type}`}>{message.text}</div>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>{transactionType === 'FEE' ? 'Fee Collection Details' : 'Salary Payment Details'}</h3>
          <div className="form-grid">
            
            <div className="input-group">
              <label>Amount (₹) *</label>
              <input type="number" name="Amount" value={formData.Amount} onChange={handleInputChange} required />
            </div>

            <div className="input-group">
              <label>Date of Transaction *</label>
              <input type="date" name="Date" value={formData.Date} onChange={handleInputChange} required />
            </div>

            {transactionType === 'FEE' ? (
              <>
                <div className="input-group">
                  <label>Select Student *</label>
                  <select name="Student_id" value={formData.Student_id} onChange={handleInputChange} required>
                    <option value="">-- Choose a Student --</option>
                    {students.map(student => (
                      <option key={student.Student_id} value={student.Student_id}>
                        {student.First_name} {student.Last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Select Batch *</label>
                  <select name="Batch_id" value={formData.Batch_id} onChange={handleInputChange} required>
                    <option value="">-- Choose a Batch --</option>
                    {batches.map(batch => (
                      <option key={batch.Batch_id} value={batch.Batch_id}>
                        {batch.Course_Name || `Batch #${batch.Batch_id}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Payment Mode *</label>
                  <select name="Mode_of_payment" value={formData.Mode_of_payment} onChange={handleInputChange} required>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="input-group">
                  <label>Staff Role</label>
                  <select value={payeeRole} onChange={(e) => setPayeeRole(e.target.value)}>
                    <option value="TEACHER">Teacher</option>
                    <option value="ASSISTANT">Assistant</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Select Payee *</label>
                  <select name="Payee_id" value={formData.Payee_id} onChange={handleInputChange} required>
                    <option value="">-- Choose Staff Member --</option>
                    {/* Assuming we'd fetch assistants too, defaulting to teachers here for speed */}
                    {teachers.map(teacher => (
                      <option key={teacher.Teacher_id} value={teacher.Teacher_id}>
                        {teacher.First_name} {teacher.Last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Salary Month *</label>
                  <select name="Month" value={formData.Month} onChange={handleInputChange} required>
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Salary Year *</label>
                  <input type="number" name="Year" value={formData.Year} onChange={handleInputChange} required />
                </div>
              </>
            )}

          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={isSubmitting}>
            {isSubmitting ? <span className="btn-spinner"></span> : `Record ${transactionType === 'FEE' ? 'Fee' : 'Salary'}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FinanceTracker;