import React, { useState, useEffect } from 'react';
import { getAllStudents, getAllBatches, enrollStudent } from '../../../api/apiService';
import '../AssistantForms.css';

const EnrollmentBuilder = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    Student_id: '',
    Batch_id: '',
    Discount: 0,
    Enrollment_date: new Date().toISOString().split('T')[0] // Auto-fill today's date
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [studentData, batchData] = await Promise.all([
          getAllStudents(),
          getAllBatches()
        ]);
        setStudents(studentData || []);
        setBatches(batchData || []);
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load system data.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDropdownData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsSubmitting(true);

    try {
      await enrollStudent(formData);
      setMessage({ type: 'success', text: 'Student successfully enrolled in the batch!' });
      setFormData({ ...formData, Student_id: '', Batch_id: '', Discount: 0 });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to enroll student.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="loader-wrapper"><div className="spinner"></div></div>;

  return (
    <div className="assistant-form-container">
      <div className="page-header">
        <h2>Enroll Student</h2>
        <p>Assign registered students to active course batches.</p>
      </div>

      {message.text && <div className={`alert-banner ${message.type}`}>{message.text}</div>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Enrollment Configuration</h3>
          <div className="form-grid">
            
            <div className="input-group">
              <label>Select Student *</label>
              <select name="Student_id" value={formData.Student_id} onChange={handleInputChange} required>
                <option value="">-- Choose a Student --</option>
                {students.map(student => (
                  <option key={student.Student_id} value={student.Student_id}>
                    {student.First_name} {student.Last_name} ({student.Email})
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
                    {batch.Course_Name || `Batch #${batch.Batch_id}`} - {batch.Start_time}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Discount Amount (₹)</label>
              <input 
                type="number" 
                name="Discount" 
                value={formData.Discount} 
                onChange={handleInputChange} 
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="input-group">
              <label>Enrollment Date *</label>
              <input 
                type="date" 
                name="Enrollment_date" 
                value={formData.Enrollment_date} 
                onChange={handleInputChange} 
                required 
              />
            </div>

          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={isSubmitting}>
            {isSubmitting ? <span className="btn-spinner"></span> : 'Confirm Enrollment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnrollmentBuilder;