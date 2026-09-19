import React, { createContext, useContext, useState } from 'react';

import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('depthfence_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || '';
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      if (res.data && res.data.user) {
        const userData = { ...res.data.user, token: res.data.token };
        setUser(userData);
        localStorage.setItem('depthfence_user', JSON.stringify(userData));
        localStorage.setItem('depthfence_token', res.data.token); // Save token for protected routes
        return { success: true, user: userData };
      }
      return { success: false, error: 'Invalid response from server' };
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to authenticate.' 
      };
    }
  };

  const register = async (formData) => {
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || '';
      
      // Axios automatically determines the correct Content-Type:
      // - If formData is a plain object, it sends application/json
      // - If formData is a FormData instance, it sets multipart/form-data with the correct boundary
      const res = await axios.post(`${API_URL}/api/auth/register`, formData);

      // If they are an employee, it returns pending status without a token
      if (res.data && res.data.status === 'Pending') {
        return { success: true, pending: true, msg: res.data.msg };
      }

      // Auto login for normal user
      if (res.data && res.data.user) {
        const userData = { ...res.data.user, token: res.data.token };
        setUser(userData);
        localStorage.setItem('depthfence_user', JSON.stringify(userData));
        localStorage.setItem('depthfence_token', res.data.token);
        return { success: true, user: userData };
      }

      return { success: false, error: 'Registration failed.' };
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to register.',
        code: err.response?.data?.code,
        status: err.response?.status
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('depthfence_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
