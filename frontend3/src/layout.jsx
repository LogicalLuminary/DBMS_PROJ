import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './auth';
import { api } from './api';
import { Avatar } from './ui';
import { fullName, initials } from './util';

export const NAV = {
  student: [['batches', 'My Batches'], ['notifications', 'Notifications'], ['complaints', 'Complaints'], ['profile', 'Profile']],
  teacher: [['batches', 'My Batches'], ['notifications', 'Notifications'], ['salary', 'Salary Status'], ['complaints', 'Complaints'], ['profile', 'Profile']],
  assistant: [['users', 'Students / Teachers'], ['courses', 'Courses'], ['batches', 'Batches'], ['enrollments', 'Enrollments'], ['certificates', 'Certificates'],
    ['fees', 'Fees'], ['salaries', 'Salaries'], ['attendance', 'Attendance'], ['notifications', 'Global Notifications'], ['complaints', 'Complaints'], ['records', 'My Salary & Attendance'], ['profile', 'Profile']],
  admin: [['users', 'Users & Accounts'], ['courses', 'Courses'], ['batches', 'Batches'], ['enrollments', 'Enrollments'], ['certificates', 'Certificates'],
    ['fees', 'Fees'], ['salaries', 'Salaries'], ['attendance', 'Attendance'], ['notifications', 'Global Notifications'], ['complaints', 'Complaints'], ['profile', 'Profile']],
};

export function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className="navbar">
      <Link to="/" className="logo">🎓 Edu<span>Portal</span></Link>
      <nav>
        <NavLink to="/catalog">Course Catalog</NavLink>
        <NavLink to="/about">About Us</NavLink>
        {user ? (
          <>
            <NavLink to={`/${user.role}`}>Dashboard</NavLink>
            <Link to={`/${user.role}/profile`} title={fullName(user.profile)}><Avatar text={initials(user.profile)} /></Link>
            <button className="btn ghost" onClick={async () => { await logout(); nav('/'); }}>Logout</button>
          </>
        ) : <NavLink to="/login" className="btn">Login</NavLink>}
      </nav>
    </header>
  );
}

export const Footer = () => (
  <footer className="footer">
    <div><b>🎓 EduPortal</b><p>Quality coaching, transparent management.</p></div>
    <div><p>📍 Varanasi, Uttar Pradesh, India</p><p>✉ contact@eduportal.example</p></div>
    <div><Link to="/catalog">Courses</Link> · <Link to="/about">About</Link> · <Link to="/login">Login</Link></div>
    <small>© {new Date().getFullYear()} EduPortal. All rights reserved.</small>
  </footer>
);

export const PublicLayout = () => (<><Navbar /><main className="public"><Outlet /></main><Footer /></>);

export function DashboardLayout({ role, children }) {
  const { user, logout, lastSeen } = useAuth();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    if (role === 'admin') return;
    api.list('globalnotification').then((l) => setUnread(l.filter((n) => lastSeen === null || n.notification_id > lastSeen).length)).catch(() => {});
  }, [loc.pathname, lastSeen, role]);
  useEffect(() => setOpen(false), [loc.pathname]);

  return (
    <div className="dash">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <Link to="/" className="logo side-logo">🎓 Edu<span>Portal</span></Link>
        <div className="me">
          <Avatar text={initials(user.profile)} size={44} />
          <div><b>{fullName(user.profile)}</b><small className="role">{role}</small></div>
        </div>
        <nav>
          {NAV[role].map(([to, label]) => (
            <NavLink key={to} to={`/${role}/${to}`}>
              {label}{to === 'notifications' && unread > 0 && <em className="dot">{unread}</em>}
            </NavLink>
          ))}
        </nav>
        <button className="btn ghost block" onClick={async () => { await logout(); nav('/'); }}>Logout</button>
      </aside>
      <div className="dash-main">
        <div className="topbar">
          <button className="burger" onClick={() => setOpen(!open)}>☰</button>
          <span className="muted">Welcome back, <b>{user.profile.first_name}</b></span>
          <Link to="/catalog" className="muted">Course Catalog</Link>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}

export function Guard({ role, children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="muted pad">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return children;
}
