import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    // Only one specific admin allowed
    if (email === 'admin@depthfence.in' && password === 'SecureAdmin2026!') {
      setUser({
        email,
        role: 'admin',
        name: 'System Administrator'
      });
      return true;
    } else if (email && password) {
      // Everyone else is a normal surveyor
      setUser({
        email,
        role: 'surveyor',
        name: 'Field Surveyor'
      });
      return true;
    }
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
