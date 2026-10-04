import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// Import the API service we built earlier instead of the missing services/api file
import { login as apiLogin, logout as apiLogout } from '../api/apiService'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null);

  // Initialize Auth State on Mount
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('institute_auth_token');
      const savedUser = localStorage.getItem('institute_user_data');
      
      if (!token || !savedUser) {
        setIsLoading(false);
        return;
      }

      try {
        // Restore user session from local storage to avoid needing a /me endpoint
        setUser(JSON.parse(savedUser)); 
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Auth Initialization Error:', err);
        localStorage.removeItem('institute_auth_token');
        localStorage.removeItem('institute_user_data');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login Function
  const login = useCallback(async (credentials) => {
    setError(null);
    try {
      // Calls the login function from our apiService.js
      const response = await apiLogin(credentials);
      
      // Handle potential capitalized keys from Java backend
      const token = response.token || response.Token;
      const userObj = response.user || response.User || {};
      
      // Fallback to the role passed in credentials if backend omits it in response
      const userRole = userObj.role || userObj.Role || credentials.Role;

      if (token) {
        localStorage.setItem('institute_auth_token', token);
      }

      const finalUser = { ...userObj, role: userRole };
      
      // Save user data so it persists on page refresh
      localStorage.setItem('institute_user_data', JSON.stringify(finalUser));
      
      setUser(finalUser); 
      setIsAuthenticated(true);
      
      return { success: true, role: userRole };
    } catch (err) {
      const errorMessage = err.message || 'Invalid credentials';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Logout Function
  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('institute_auth_token');
      if (token) {
        await apiLogout(); // Calls logout from apiService.js
      }
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      localStorage.removeItem('institute_auth_token');
      localStorage.removeItem('institute_user_data');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center', fontFamily: 'sans-serif', color: '#4b5563' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p>Verifying secure session...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};