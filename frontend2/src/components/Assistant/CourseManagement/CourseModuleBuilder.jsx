import React, { useState, useEffect } from 'react';
import { getAllCourses } from '../../../api/apiService';
// Assuming createCourseModule will be in the final apiService
import { createCourseModule } from '../../../api/apiService';
import '../AssistantForms.css';

const CourseModuleBuilder = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    Course_id: '',
    Module_title: '',
    Module_description: ''
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courseData = await getAllCourses();
        setCourses(courseData || []);
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load courses from the system.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsSubmitting(true);

    try {
      // Mocking Module_id generation on the frontend for now, usually handled by DB auto-increment
      const payload = { 
        ...formData, 
        Module_id: Date.now() 
      };
      await createCourseModule(payload);
      
      setMessage({ type: 'success', text: 'Module successfully added to the course!' });
      // Reset title and description, but keep the selected course for rapid entry
      setFormData({ ...formData, Module_title: '', Module_description: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to add course module.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="loader-wrapper"><div className="spinner"></div></div>;

  return (
    <div className="assistant-form-container">
      <div className="page-header">
        <h2>Course Module Builder</h2>
        <p>Attach new learning modules and syllabus details to existing courses.</p>
      </div>

      {message.text && <div className={`alert-banner ${message.type}`}>{message.text}</div>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Module Details</h3>
          <div className="form-grid">
            
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Target Course *</label>
              <select 
                name="Course_id" 
                value={formData.Course_id} 
                onChange={handleInputChange} 
                required
              >
                <option value="">-- Select the Course --</option>
                {courses.map(course => (
                  <option key={course.Course_id} value={course.Course_id}>
                    {course.Course_Name} (ID: {course.Course_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Module Title *</label>
              <input 
                type="text" 
                name="Module_title" 
                value={formData.Module_title} 
                onChange={handleInputChange} 
                placeholder="e.g., Introduction to React Hooks"
                required 
              />
            </div>

            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Module Description *</label>
              <textarea 
                name="Module_description" 
                value={formData.Module_description} 
                onChange={handleInputChange} 
                placeholder="Detailed breakdown of the topics covered in this module..."
                rows="4"
                required 
              />
            </div>

          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={isSubmitting || !formData.Course_id}>
            {isSubmitting ? <span className="btn-spinner"></span> : 'Save Module'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseModuleBuilder;