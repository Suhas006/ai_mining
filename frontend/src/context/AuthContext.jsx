import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('depthfence_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (email, password) => {
    // Fixed Admin Account
    if (email === 'admin@depthfence.in' && password === 'SecureAdmin2026!') {
      const userData = {
        email,
        role: 'admin',
        name: 'System Administrator'
      };
      setUser(userData);
      localStorage.setItem('depthfence_user', JSON.stringify(userData));
      return true;
    } 
    // Normal Users (Surveyors) dynamic registration/login
    else if (email !== 'admin@depthfence.in' && email && password) {
      const storedUsers = JSON.parse(localStorage.getItem('registered_users') || '{}');
      
      // If user exists, check password
      if (storedUsers[email]) {
        if (storedUsers[email] === password) {
          const userData = {
            email,
            role: 'surveyor',
            name: 'Field Surveyor'
          };
          setUser(userData);
          localStorage.setItem('depthfence_user', JSON.stringify(userData));
          return true;
        } else {
          return false; // Wrong password
        }
      } 
      // If user doesn't exist, register them with this password
      else {
        storedUsers[email] = password;
        localStorage.setItem('registered_users', JSON.stringify(storedUsers));
        const userData = {
          email,
          role: 'surveyor',
          name: 'Field Surveyor'
        };
        setUser(userData);
        localStorage.setItem('depthfence_user', JSON.stringify(userData));
        return true;
      }
    }
    
    // Reject all other attempts
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('depthfence_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
