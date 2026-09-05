import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    // Basic mock authentication based on email
    if (email.toLowerCase().includes('admin')) {
      setUser({
        email,
        role: 'admin',
        name: 'System Administrator'
      });
    } else {
      setUser({
        email,
        role: 'surveyor',
        name: 'Field Surveyor'
      });
    }
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
