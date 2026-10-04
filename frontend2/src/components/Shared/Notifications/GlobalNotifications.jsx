import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
// Assuming getGlobalNotifications and createGlobalNotification are in apiService
import { getGlobalNotifications, createGlobalNotification } from '../../../api/apiService';
import { ROLES } from '../../../utils/constants';
import './GlobalNotifications.css';

const GlobalNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state for Assistants/Admins
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreate = user?.role === ROLES.ASSISTANT || user?.role === ROLES.ADMIN;

  useEffect(() => {
    fetchNotifications();
    // Logic to call an endpoint updating LastSeen_Global_Notification_id would go here
  }, [user]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getGlobalNotifications();
      // Sort by date/time descending to show newest first
      const sortedData = (data || []).sort((a, b) => 
        new Date(`${b.Notification_date}T${b.Notification_time}`) - new Date(`${a.Notification_date}T${a.Notification_time}`)
      );
      setNotifications(sortedData);
    } catch (err) {
      setError('Unable to load global notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostNotification = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    setIsSubmitting(true);
    try {
      const currentDateTime = new Date();
      await createGlobalNotification({
        Assistant_id: user.id, // The assistant creating it
        Notification_title: newTitle,
        Description: newDescription,
        Notification_date: currentDateTime.toISOString().split('T')[0],
        Notification_time: currentDateTime.toTimeString().split(' ')[0]
      });
      
      setNewTitle('');
      setNewDescription('');
      setShowForm(false);
      fetchNotifications();
    } catch (err) {
      setError('Failed to post notification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="loader-wrapper"><div className="spinner"></div></div>;

  return (
    <div className="notifications-container">
      <div className="page-header flex-between-header">
        <div>
          <h2>Institute Announcements</h2>
          <p>Official global updates and alerts for all students and staff.</p>
        </div>
        {canCreate && (
          <button className="action-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Announcement'}
          </button>
        )}
      </div>

      {error && <div className="alert-banner error">{error}</div>}

      {/* Creation Form (Assistants & Admins Only) */}
      {showForm && canCreate && (
        <div className="announcement-form-card">
          <h3>Broadcast New Announcement</h3>
          <p className="help-text">This will be visible to all users. Notifications cannot be deleted.</p>
          <form onSubmit={handlePostNotification} className="info-form">
            <div className="input-group">
              <label>Headline *</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Campus Closed for Holidays"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="input-group">
              <label>Details *</label>
              <textarea 
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Provide the full announcement text..."
                rows="4"
                required
                disabled={isSubmitting}
              ></textarea>
            </div>
            <button type="submit" className="save-btn" disabled={isSubmitting}>
              {isSubmitting ? <span className="btn-spinner"></span> : 'Broadcast to Institute'}
            </button>
          </form>
        </div>
      )}

      {/* Notifications Feed */}
      <div className="notifications-feed">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <p>No recent announcements.</p>
          </div>
        ) : (
          notifications.map((notif, index) => (
            <div key={notif.Notification_id || index} className="notification-card">
              <div className="notif-header">
                <h4>{notif.Notification_title}</h4>
                <div className="notif-meta">
                  <span className="notif-date">📅 {notif.Notification_date}</span>
                  <span className="notif-time">⏰ {notif.Notification_time}</span>
                </div>
              </div>
              <p className="notif-body">{notif.Description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GlobalNotifications;