import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLiveData } from '../context/LiveDataContext';
import { ShieldAlert, Users, Server, Globe, AlertTriangle, Terminal, Lock, Download, Map as MapIcon, Box, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  const { auditLogs, totalScans, ulpinsMinted } = useLiveData();
  
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const fetchManagementData = async () => {
    try {
      const token = localStorage.getItem('depthfence_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [pendingRes, activeRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/employees/pending`, config),
        axios.get(`${API_URL}/api/admin/employees/active`, config)
      ]);
      
      setPendingEmployees(pendingRes.data);
      setActiveUsers(activeRes.data);
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchManagementData();
    }
  }, [user]);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('depthfence_token');
      await axios.post(`${API_URL}/api/admin/employees/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchManagementData();
    } catch (err) {
      console.error('Approval failed', err);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;
    try {
      const token = localStorage.getItem('depthfence_token');
      await axios.post(`${API_URL}/api/admin/employees/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchManagementData();
    } catch (err) {
      console.error('Rejection failed', err);
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm("Are you sure you want to revoke this user's access?")) return;
    try {
      const token = localStorage.getItem('depthfence_token');
      await axios.delete(`${API_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchManagementData();
    } catch (err) {
      console.error('Revoke failed', err);
    }
  };

  // 403 Access Denied Guard
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B0F17] p-8 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">403 Access Denied</h1>
        <p className="text-red-600 dark:text-red-400 max-w-md mx-auto">
          You do not have the required security clearance to access the DepthFence Administrator Panel. Your access attempt has been logged.
        </p>
      </div>
    );
  }

  // Get active surveyors dynamically
  const uniqueUsers = new Set(auditLogs.map(log => log.user));
  const activeSurveyors = uniqueUsers.size > 0 ? uniqueUsers.size : 1;

  // Format timestamp safely
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toISOString().replace('T', ' ').substring(0, 19);
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 relative font-sans">
      <div className="max-w-6xl mx-auto z-10 relative space-y-8">
        
        {/* Page Header */}
        <div className="border-b border-[#F97316]/20 pb-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-[#F97316]/10 dark:bg-[#F97316]/20 text-[#F97316] text-xs font-mono font-bold uppercase rounded-full border border-[#F97316]/30 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              RESTRICTED ZONE
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">System Overview</h1>
          <p className="text-[#F97316] dark:text-[#F97316]/70 mt-2 font-mono text-sm">DepthFence Central Command Interface</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Metric 1 */}
          <div className="bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-[#F97316]/30 rounded-xl p-5 relative overflow-hidden group shadow-sm dark:shadow-none">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#F97316]/10 blur-2xl rounded-full"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[#F97316]/10 rounded-lg text-[#F97316]">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-slate-500 dark:text-[#94A3B8] text-sm font-bold uppercase tracking-wider">Active Surveyors</div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono">{activeSurveyors}</div>
            <div className="text-xs text-[#10B981] font-bold mt-2">Live Session Metric</div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-[#F97316]/30 rounded-xl p-5 relative overflow-hidden group shadow-sm dark:shadow-none">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#F97316]/10 blur-2xl rounded-full"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[#F97316]/10 rounded-lg text-[#F97316]">
                <MapIcon className="w-6 h-6" />
              </div>
              <div className="text-slate-500 dark:text-[#94A3B8] text-sm font-bold uppercase tracking-wider">GeoAI Scans</div>
            </div>
            <div className="text-3xl font-bold text-[#0EA5E9] font-mono">{totalScans}</div>
            <div className="text-xs text-[#94A3B8] font-bold mt-2">Aggregated globally</div>
          </div>

          {/* Metric 3 */}
          <div className="bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-[#F97316]/30 rounded-xl p-5 relative overflow-hidden group shadow-sm dark:shadow-none">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#F97316]/10 blur-2xl rounded-full"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[#F97316]/10 rounded-lg text-[#F97316]">
                <Box className="w-6 h-6" />
              </div>
              <div className="text-slate-500 dark:text-[#94A3B8] text-sm font-bold uppercase tracking-wider">3D ULPINs (24h)</div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono">{ulpinsMinted}</div>
            <div className="text-xs text-[#10B981] font-bold mt-2">Minted live</div>
          </div>

          {/* Metric 4 */}
          <div className="bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-[#F97316]/30 rounded-xl p-5 relative overflow-hidden group shadow-sm dark:shadow-none">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#F97316]/10 blur-2xl rounded-full"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[#10B981]/10 rounded-lg text-[#10B981]">
                <Globe className="w-6 h-6" />
              </div>
              <div className="text-slate-500 dark:text-[#94A3B8] text-sm font-bold uppercase tracking-wider">System Health</div>
            </div>
            <div className="text-3xl font-bold text-[#10B981] font-mono">100%</div>
            <div className="text-xs text-[#10B981] font-bold mt-2">All nodes operational</div>
          </div>

        </div>

        {/* Security Audit Log */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#F97316]" />
              Security Audit Log
            </h3>
          </div>
          
          <div className="bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-[#F97316]/20 rounded-xl overflow-hidden shadow-sm dark:shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#F97316]/20 text-xs uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
                    <th className="px-6 py-4 font-bold">Timestamp</th>
                    <th className="px-6 py-4 font-bold">Event Type</th>
                    <th className="px-6 py-4 font-bold">User</th>
                    <th className="px-6 py-4 font-bold">IP Address</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-mono text-slate-700 dark:text-[#E2E8F0] divide-y divide-slate-100 dark:divide-[#1E293B]">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-[#94A3B8]">No audit logs recorded yet.</td>
                    </tr>
                  ) : (
                    [...auditLogs].reverse().map((log, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/50 transition-colors">
                        <td className="px-6 py-4 text-slate-500 dark:text-[#94A3B8] whitespace-nowrap">{formatTime(log.timestamp)}</td>
                        <td className="px-6 py-4 flex items-center gap-2 text-[#0EA5E9] font-bold">
                          {log.event.includes('Login') && <Lock className="w-4 h-4" />}
                          {log.event.includes('Export') && <Download className="w-4 h-4" />}
                          {log.event.includes('Mint') && <Box className="w-4 h-4" />}
                          {log.event.includes('Scan') && <MapIcon className="w-4 h-4" />}
                          {log.event}
                        </td>
                        <td className="px-6 py-4">{log.user}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-[#94A3B8]">{log.ip}</td>
                        <td className="px-6 py-4">
                          <span className={log.status === 'SUCCESS' ? 'text-[#10B981]' : 'text-red-500'}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* User & Employee Management */}
        <div className="mt-8 space-y-8">
          
          {/* Pending Approvals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Pending Employee Approvals
                {pendingEmployees.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold">
                    {pendingEmployees.length}
                  </span>
                )}
              </h3>
            </div>
            
            <div className="bg-white dark:bg-[#131B2B] border border-amber-500/20 rounded-xl overflow-hidden shadow-sm dark:shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-amber-50 dark:bg-[#0F172A] border-b border-amber-200 dark:border-amber-500/20 text-xs uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
                      <th className="px-6 py-4 font-bold">Employee Name</th>
                      <th className="px-6 py-4 font-bold">Email</th>
                      <th className="px-6 py-4 font-bold">Education</th>
                      <th className="px-6 py-4 font-bold">Photo ID</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-700 dark:text-[#E2E8F0] divide-y divide-slate-100 dark:divide-[#1E293B]">
                    {pendingEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-[#94A3B8]">No pending approvals.</td>
                      </tr>
                    ) : (
                      pendingEmployees.map((emp) => (
                        <tr key={emp._id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/50 transition-colors">
                          <td className="px-6 py-4 font-semibold">{emp.fullName}</td>
                          <td className="px-6 py-4 text-slate-500 dark:text-[#94A3B8]">{emp.officialEmail}</td>
                          <td className="px-6 py-4 text-xs">{emp.education || 'N/A'}</td>
                          <td className="px-6 py-4">
                            {emp.photoUrl ? (
                              <a href={emp.photoUrl} target="_blank" rel="noreferrer" className="text-[#0EA5E9] hover:underline text-xs flex items-center gap-1">
                                <Box className="w-3 h-3" /> View ID
                              </a>
                            ) : (
                              <span className="text-slate-400 text-xs">No ID</span>
                            )}
                          </td>
                          <td className="px-6 py-4 flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleApprove(emp._id)}
                              className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleReject(emp._id)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Active Directory */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0EA5E9]" />
                Active Directory
              </h3>
            </div>
            
            <div className="bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-[#0EA5E9]/20 rounded-xl overflow-hidden shadow-sm dark:shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#0EA5E9]/20 text-xs uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
                      <th className="px-6 py-4 font-bold">User Name</th>
                      <th className="px-6 py-4 font-bold">Email</th>
                      <th className="px-6 py-4 font-bold">Role</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-700 dark:text-[#E2E8F0] divide-y divide-slate-100 dark:divide-[#1E293B]">
                    {activeUsers.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500 dark:text-[#94A3B8]">No active users.</td>
                      </tr>
                    ) : (
                      activeUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/50 transition-colors">
                          <td className="px-6 py-4 font-semibold">{u.fullName}</td>
                          <td className="px-6 py-4 text-slate-500 dark:text-[#94A3B8]">{u.officialEmail}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                              {u.registrationType || 'User'}
                            </span>
                          </td>
                          <td className="px-6 py-4 flex items-center justify-end">
                            <button 
                              onClick={() => handleRevoke(u._id)}
                              className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded text-xs font-bold transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
        </div>
        
      </div>
    </div>
  );
};

export default AdminPanel;
