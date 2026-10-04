import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ROLES } from '../../../utils/constants';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [credential, setCredential] = useState(''); // Changed from password to credential
  const [role, setRole] = useState(ROLES.STUDENT);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!email || !credential || !role) {
      setFormError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);

    const loginPayload = { 
      email: email, 
      credential: credential, 
      role: role 
    };

    const result = await login(loginPayload);

    if (result.success) {
      navigate(`/${result.role}`);
    } else {
      setFormError(result.message || 'Login failed. Please check your credentials and role.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="login-subtitle">Sign in to access your dashboard</p>
        
        {formError && <div className="error-banner">{formError}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>I am logging in as a:</label>
            <div className="role-selector">
              {[ROLES.STUDENT, ROLES.TEACHER, ROLES.ASSISTANT, ROLES.ADMIN].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`role-btn ${role === r ? 'active' : ''}`}
                  onClick={() => setRole(r)}
                  disabled={isSubmitting}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
          </div>

          <div className="input-group">
            <label htmlFor="credential">Password / Credential</label>
            <input
              type="password" /* Keep type="password" so the characters are hidden */
              id="credential"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              placeholder="Enter your credential"
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? <span className="btn-spinner"></span> : 'Sign In'}
          </button>
        </form>
        <div className="login-footer">
          <p>Don't have an account? Contact your administrator.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;