import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { updatePassword } from '../../../api/apiService';
import './ProfileEdit.css';

const ProfileEdit = () => {
  const { user } = useAuth();
  
  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Assuming user object has 'role' and their specific ID (e.g., Student_id) mapped as 'id'
      await updatePassword(user.role, user.id, { 
        oldPassword, 
        newPassword 
      });
      
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        <p>View your personal details and manage your security settings.</p>
      </div>

      <div className="profile-grid">
        {/* Immutable Personal Details Section */}
        <div className="profile-section">
          <h3>Personal Details</h3>
          <div className="info-form">
            <div className="input-group">
              <label>First Name</label>
              <input type="text" value={user?.First_name || ''} disabled />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input type="text" value={user?.Last_name || ''} disabled />
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <input type="email" value={user?.Email || ''} disabled />
            </div>
            <div className="input-group">
              <label>Government ID (Aadhar)</label>
              <input type="text" value={user?.Aadhar_id ? '********' + user.Aadhar_id.slice(-4) : 'Not Provided'} disabled />
              <small className="help-text">Contact an administrator to change restricted fields.</small>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="profile-section security-section">
          <h3>Change Password</h3>
          
          {message.text && (
            <div className={`alert-banner ${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="info-form">
            <div className="input-group">
              <label>Current Password</label>
              <input 
                type="password" 
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Enter current password"
              />
            </div>
            <div className="input-group">
              <label>New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Enter new password"
              />
            </div>
            <div className="input-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Confirm new password"
              />
            </div>
            
            <button type="submit" className="save-btn" disabled={isSubmitting}>
              {isSubmitting ? <span className="btn-spinner"></span> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;