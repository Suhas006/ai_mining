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
    // Fixed User (Surveyor) Account
    else if (email === 'user@depthfence.in' && password === 'Surveyor2026!') {
      setUser({
        email,
        role: 'surveyor',
        name: 'Field Surveyor'
      });
      return true;
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
