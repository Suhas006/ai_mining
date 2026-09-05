import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    // Fixed Admin Account
    if (email === 'admin@depthfence.in' && password === 'SecureAdmin2026!') {
      setUser({
        email,
        role: 'admin',
        name: 'System Administrator'
      });
      return true;
    } 
    // Normal Users (Surveyors) dynamic registration/login
    else if (email !== 'admin@depthfence.in' && email && password) {
      const storedUsers = JSON.parse(localStorage.getItem('registered_users') || '{}');
      
      // If user exists, check password
      if (storedUsers[email]) {
        if (storedUsers[email] === password) {
          setUser({
            email,
            role: 'surveyor',
            name: 'Field Surveyor'
          });
          return true;
        } else {
          return false; // Wrong password
        }
      } 
      // If user doesn't exist, register them with this password
      else {
        storedUsers[email] = password;
        localStorage.setItem('registered_users', JSON.stringify(storedUsers));
        setUser({
          email,
          role: 'surveyor',
          name: 'Field Surveyor'
        });
        return true;
      }
    }
    
    // Reject all other attempts
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
