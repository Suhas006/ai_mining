import React, { createContext, useContext, useState, useEffect } from 'react';

const LiveDataContext = createContext();

export const LiveDataProvider = ({ children }) => {
  const [totalScans, setTotalScans] = useState(() => {
    return parseInt(localStorage.getItem('totalScans') || '0', 10);
  });
  
  const [ulpinsMinted, setUlpinsMinted] = useState(() => {
    return parseInt(localStorage.getItem('ulpinsMinted') || '0', 10);
  });
  
  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('auditLogs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('totalScans', totalScans.toString());
  }, [totalScans]);

  useEffect(() => {
    localStorage.setItem('ulpinsMinted', ulpinsMinted.toString());
  }, [ulpinsMinted]);

  useEffect(() => {
    localStorage.setItem('auditLogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const incrementScans = () => setTotalScans(prev => prev + 1);
  const incrementUlpins = () => setUlpinsMinted(prev => prev + 1);
  
  const addAuditLog = (event, user) => {
    const newLog = {
      timestamp: new Date().toISOString(),
      event,
      user,
      ip: '192.168.1.' + Math.floor(Math.random() * 255), // Mock IP for flavor
      status: 'SUCCESS'
    };
    setAuditLogs(prev => [...prev, newLog]);
  };

  return (
    <LiveDataContext.Provider value={{ totalScans, ulpinsMinted, auditLogs, incrementScans, incrementUlpins, addAuditLog }}>
      {children}
    </LiveDataContext.Provider>
  );
};

export const useLiveData = () => useContext(LiveDataContext);
