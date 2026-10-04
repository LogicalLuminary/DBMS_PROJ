import React, { useState, useEffect } from 'react';
import { getAllCourses, getAllTeachers, createBatch } from '../../../api/apiService';
import '../AssistantForms.css';

const BatchBuilder = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    Course_id: '',
    Teacher_id: '',
    Start_date: '',
    Start_time: '',
    End_time: '',
    Venue: ''
  });

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [courseData, teacherData] = await Promise.all([
          getAllCourses(),
          getAllTeachers()
        ]);
        setCourses(courseData || []);
        setTeachers(teacherData || []);
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load courses or teachers.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDependencies();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsSubmitting(true);

    try {
      await createBatch(formData);
      setMessage({ type: 'success', text: 'Batch created successfully!' });
      setFormData({ Course_id: '', Teacher_id: '', Start_date: '', Start_time: '', End_time: '', Venue: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to create batch.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="loader-wrapper"><div className="spinner"></div></div>;

  return (
    <div className="assistant-form-container">
      <div className="page-header">
        <h2>Batch Builder</h2>
        <p>Schedule a new batch by selecting an existing course and assigning a teacher.</p>
      </div>

      {message.text && <div className={`alert-banner ${message.type}`}>{message.text}</div>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Batch Configuration</h3>
          <div className="form-grid">
            
            {/* ID-Free Selection for Course */}
            <div className="input-group">
              <label>Select Course *</label>
              <select name="Course_id" value={formData.Course_id} onChange={handleInputChange} required>
                <option value="">-- Choose a Course --</option>
                {courses.map(course => (
                  <option key={course.Course_id} value={course.Course_id}>
                    {course.Course_Name} (₹{course.Price})
                  </option>
                ))}
              </select>
            </div>

            {/* ID-Free Selection for Teacher */}
            <div className="input-group">
              <label>Assign Teacher *</label>
              <select name="Teacher_id" value={formData.Teacher_id} onChange={handleInputChange} required>
                <option value="">-- Choose a Teacher --</option>
                {teachers.map(teacher => (
                  <option key={teacher.Teacher_id} value={teacher.Teacher_id}>
                    {teacher.First_name} {teacher.Last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Start Date *</label>
              <input type="date" name="Start_date" value={formData.Start_date} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>Start Time *</label>
              <input type="time" name="Start_time" value={formData.Start_time} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>End Time *</label>
              <input type="time" name="End_time" value={formData.End_time} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>Venue (Room/Link)</label>
              <input type="text" name="Venue" value={formData.Venue} onChange={handleInputChange} placeholder="e.g., Room 101 or Zoom Link" />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={isSubmitting}>
            {isSubmitting ? <span className="btn-spinner"></span> : 'Create Batch'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BatchBuilder;