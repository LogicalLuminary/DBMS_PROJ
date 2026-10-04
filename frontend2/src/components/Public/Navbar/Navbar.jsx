import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Helper to generate initials from first and last name
  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${first}${last}` || 'U';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Route the user to their specific dashboard based on their role
  const navigateToDashboard = () => {
    if (user?.role) {
      navigate(`/${user.role}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">EduManage Pro</Link>
        </div>
        
        <div className="navbar-links">
          <Link to="/courses" className="nav-item">Course Catalog</Link>
          <Link to="/about" className="nav-item">About Us</Link>
          
          {isAuthenticated ? (
            <div className="nav-user-section">
              <div className="avatar" onClick={navigateToDashboard} title="Go to Dashboard">
                {getInitials(user?.First_name, user?.Last_name)}
              </div>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <Link to="/login">
              <button className="login-btn">Login</button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;