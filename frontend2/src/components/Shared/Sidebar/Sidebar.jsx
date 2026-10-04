import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ROLES } from '../../../utils/constants';
import './Sidebar.css';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();
  const role = user?.role;

  // Helper to dynamically build links based on role requirements
  const getLinksForRole = () => {
    switch (role) {
      case ROLES.STUDENT:
        return [
          { path: '/student/batches', label: 'My Enrolled Batches' },
          { path: '/student/notifications', label: 'Global Notifications' },
          { path: '/student/complaints', label: 'My Complaints' },
          { path: '/student/profile', label: 'Edit Profile' },
        ];
      case ROLES.TEACHER:
        return [
          { path: '/teacher/batches', label: 'My Taught Batches' },
          { path: '/teacher/notifications', label: 'Global Notifications' },
          { path: '/teacher/complaints', label: 'My Complaints' },
          { path: '/teacher/salary', label: 'Salary Status' },
          { path: '/teacher/profile', label: 'Edit Profile' },
        ];
      case ROLES.ASSISTANT:
      case ROLES.ADMIN:
        const links = [
          { path: `/${role}/students`, label: 'Manage Students' },
          { path: `/${role}/teachers`, label: 'Manage Teachers' },
          { path: `/${role}/courses`, label: 'Manage Courses' },
          { path: `/${role}/batches`, label: 'Manage Batches' },
          { path: `/${role}/enrollments`, label: 'Student Enrollments' },
          { path: `/${role}/finance`, label: 'Fees & Salaries' },
          { path: `/${role}/attendance`, label: 'Mark Attendance' },
          { path: `/${role}/certifications`, label: 'Certifications' },
          { path: `/${role}/notifications`, label: 'Global Notifications' },
          { path: `/${role}/my-portal`, label: 'My Attendance & Salary' },
          { path: `/${role}/complaints`, label: 'Complaints' },
          { path: `/${role}/profile`, label: 'Edit Profile' },
        ];
        return links;
      default:
        return [];
    }
  };

  const links = getLinksForRole();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h3>{role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User'} Panel</h3>
        <button className="close-btn mobile-only" onClick={closeSidebar}>×</button>
      </div>
      
      <nav className="sidebar-nav">
        {links.map((link, index) => (
          <NavLink 
            key={index} 
            to={link.path} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar} // Auto-close sidebar on mobile after clicking
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;