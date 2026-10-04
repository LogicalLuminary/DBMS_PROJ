import React, { useState, useEffect } from 'react';
import { getAllCourses } from '../../../api/apiService';
import './CourseCatalog.css';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAllCourses();
        setCourses(data);
        
        // Extract unique categories and take the first 3 to match requirements
        const uniqueCategories = [...new Set(data.map(course => course.Category))].slice(0, 3);
        setCategories(uniqueCategories);
      } catch (err) {
        setError('Unable to load courses at this time. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses based on the clicked category
  const displayedCourses = selectedCategory 
    ? courses.filter(course => course.Category === selectedCategory)
    : [];

  if (isLoading) {
    return (
      <div className="catalog-container loader-container">
        <div className="spinner"></div>
        <p>Loading course catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalog-container error-container">
        <div className="error-banner">{error}</div>
      </div>
    );
  }

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h1>Explore Our Programs</h1>
        <p>Discover the perfect course to advance your career.</p>
      </div>

      {!selectedCategory ? (
        <div className="category-grid">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="category-card"
              onClick={() => setSelectedCategory(category)}
            >
              <h3>{category}</h3>
              <p>Explore all courses in {category}</p>
              <button className="view-btn">View Courses &rarr;</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="course-list-section">
          <button 
            className="back-btn" 
            onClick={() => setSelectedCategory(null)}
          >
            &larr; Back to Categories
          </button>
          
          <h2 className="category-title">{selectedCategory} Courses</h2>
          
          <div className="course-grid">
            {displayedCourses.map((course, index) => (
              <div key={index} className="course-card">
                <div className="course-card-header">
                  <h3>{course.Course_Name}</h3>
                  <span className="price-tag">₹{course.Price}</span>
                </div>
                <p className="course-desc">{course.Description}</p>
                <div className="course-meta">
                  <span>📅 {course.No_of_weeks} Weeks</span>
                  <span>📚 {course.No_of_modules} Modules</span>
                </div>
                <div className="course-material">
                  <strong>Material:</strong> {course.Material}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;