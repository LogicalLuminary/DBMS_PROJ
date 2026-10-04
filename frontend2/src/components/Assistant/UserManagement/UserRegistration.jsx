import React, { useState } from 'react';
import { registerUser } from '../../../api/apiService';
import { ROLES } from '../../../utils/constants';
import '../AssistantForms.css';

const UserRegistration = () => {
  const [userType, setUserType] = useState(ROLES.STUDENT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Core Form State
  const [formData, setFormData] = useState({
    First_name: '', Last_name: '', Email: '', Credential: '', 
    DOB: '', Sex: '', Aadhar_id: '', House_no: '', 
    Street: '', Pincode: '', Salary: '', Joining_date: ''
  });

  // Dynamic Array States for Normalized Tables
  const [phoneNumbers, setPhoneNumbers] = useState(['']);
  const [middleNames, setMiddleNames] = useState(['']);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (index, value, type) => {
    if (type === 'phone') {
      const newPhones = [...phoneNumbers];
      newPhones[index] = value;
      setPhoneNumbers(newPhones);
    } else {
      const newNames = [...middleNames];
      newNames[index] = value;
      setMiddleNames(newNames);
    }
  };

  const addArrayField = (type) => {
    type === 'phone' ? setPhoneNumbers([...phoneNumbers, '']) : setMiddleNames([...middleNames, '']);
  };

  const removeArrayField = (index, type) => {
    if (type === 'phone') {
      setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
    } else {
      setMiddleNames(middleNames.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsSubmitting(true);

    try {
      const payload = { 
        ...formData,
        Contacts: phoneNumbers.filter(p => p.trim() !== ''),
        Middle_Names: middleNames.filter(m => m.trim() !== '')
      };

      // Clean payload based on schema constraints
      if (userType === ROLES.STUDENT) {
        delete payload.Salary;
        delete payload.Joining_date;
      } else if (userType === ROLES.ASSISTANT) {
        delete payload.Joining_date; // Assistants have salary, but no joining date in schema
      }

      // Send to the backend
      await registerUser(userType, payload);
      
      setMessage({ type: 'success', text: `${userType.charAt(0).toUpperCase() + userType.slice(1)} registered successfully!` });
      
      // Reset form
      setFormData({
        First_name: '', Last_name: '', Email: '', Credential: '', 
        DOB: '', Sex: '', Aadhar_id: '', House_no: '', Street: '', Pincode: '', Salary: '', Joining_date: ''
      });
      setPhoneNumbers(['']);
      setMiddleNames(['']);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to register user.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="assistant-form-container">
      <div className="page-header">
        <h2>Register New User</h2>
        <p>Create accounts with support for multiple contacts and middle names.</p>
      </div>

      <div className="type-toggle">
        <button 
          className={`toggle-btn ${userType === ROLES.STUDENT ? 'active' : ''}`}
          onClick={() => { setUserType(ROLES.STUDENT); setMessage({ type: '', text: '' }); }}
        >
          Student
        </button>
        <button 
          className={`toggle-btn ${userType === ROLES.TEACHER ? 'active' : ''}`}
          onClick={() => { setUserType(ROLES.TEACHER); setMessage({ type: '', text: '' }); }}
        >
          Teacher
        </button>
        <button 
          className={`toggle-btn ${userType === ROLES.ASSISTANT ? 'active' : ''}`}
          onClick={() => { setUserType(ROLES.ASSISTANT); setMessage({ type: '', text: '' }); }}
        >
          Assistant
        </button>
      </div>

      {message.text && <div className={`alert-banner ${message.type}`}>{message.text}</div>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-grid">
            <div className="input-group">
              <label>First Name *</label>
              <input type="text" name="First_name" value={formData.First_name} onChange={handleInputChange} required />
            </div>
            
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Middle Names</label>
              {middleNames.map((name, index) => (
                <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input type="text" value={name} onChange={(e) => handleArrayChange(index, e.target.value, 'name')} placeholder="Middle Name" style={{ flex: 1 }} />
                  {index > 0 && <button type="button" onClick={() => removeArrayField(index, 'name')} className="action-btn" style={{ background: '#ef4444' }}>-</button>}
                </div>
              ))}
              <button type="button" onClick={() => addArrayField('name')} className="action-btn" style={{ width: 'fit-content', background: '#e5e7eb', color: '#374151' }}>+ Add Middle Name</button>
            </div>

            <div className="input-group">
              <label>Last Name</label>
              <input type="text" name="Last_name" value={formData.Last_name} onChange={handleInputChange} />
            </div>
            <div className="input-group">
              <label>Email Address *</label>
              <input type="email" name="Email" value={formData.Email} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>Temporary Password *</label>
              <input type="text" name="Credential" value={formData.Credential} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>Date of Birth</label>
              <input type="date" name="DOB" value={formData.DOB} onChange={handleInputChange} />
            </div>
            <div className="input-group">
              <label>Gender</label>
              <select name="Sex" value={formData.Sex} onChange={handleInputChange}>
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Contact & Identity</h3>
          <div className="form-grid">
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Phone Numbers</label>
              {phoneNumbers.map((phone, index) => (
                <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input type="tel" value={phone} onChange={(e) => handleArrayChange(index, e.target.value, 'phone')} placeholder="Phone Number" style={{ flex: 1 }} />
                  {index > 0 && <button type="button" onClick={() => removeArrayField(index, 'phone')} className="action-btn" style={{ background: '#ef4444' }}>-</button>}
                </div>
              ))}
              <button type="button" onClick={() => addArrayField('phone')} className="action-btn" style={{ width: 'fit-content', background: '#e5e7eb', color: '#374151' }}>+ Add Phone Number</button>
            </div>

            <div className="input-group">
              <label>Government ID *</label>
              <input type="text" name="Aadhar_id" value={formData.Aadhar_id} onChange={handleInputChange} placeholder="12-digit number" required />
            </div>
            <div className="input-group">
              <label>House No.</label>
              <input type="text" name="House_no" value={formData.House_no} onChange={handleInputChange} />
            </div>
            <div className="input-group">
              <label>Street</label>
              <input type="text" name="Street" value={formData.Street} onChange={handleInputChange} />
            </div>
            <div className="input-group">
              <label>Pincode *</label>
              <input type="text" name="Pincode" value={formData.Pincode} onChange={handleInputChange} required />
            </div>
          </div>
        </div>

        {(userType === ROLES.TEACHER || userType === ROLES.ASSISTANT) && (
          <div className="form-section highlight-section">
            <h3>Employment Details</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>Salary (₹) *</label>
                <input type="number" name="Salary" value={formData.Salary} onChange={handleInputChange} required />
              </div>
              {userType === ROLES.TEACHER && (
                <div className="input-group">
                  <label>Joining Date *</label>
                  <input type="date" name="Joining_date" value={formData.Joining_date} onChange={handleInputChange} required />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={isSubmitting}>
            {isSubmitting ? <span className="btn-spinner"></span> : `Register ${userType}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserRegistration;