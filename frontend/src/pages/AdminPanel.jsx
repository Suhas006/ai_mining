import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLiveData } from '../context/LiveDataContext';
import { 
  ShieldAlert, Users, Server, Globe, AlertTriangle, Terminal, Lock, Download, 
  Map as MapIcon, Box, CheckCircle, XCircle, Trash2, Eye, X, Phone, MapPin, Briefcase, Calendar, Stethoscope 
} from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  const { auditLogs, totalScans, ulpinsMinted } = useLiveData();
  
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

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
      setSelectedEmployee(null);
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
      setSelectedEmployee(null);
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

  const uniqueUsers = new Set(auditLogs.map(log => log.user));
  const activeSurveyors = uniqueUsers.size > 0 ? uniqueUsers.size : 1;

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
      
      {/* -------------------- EMPLOYEE PROFILE MODAL -------------------- */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#131B2B]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0EA5E9]" />
                Employee Profile Review
              </h3>
              <button onClick={() => setSelectedEmployee(null)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col md:flex-row gap-8">
                
                {/* Photo & Basic Info Column */}
                <div className="flex flex-col items-center md:items-start md:w-1/3">
                  <div className="w-40 h-40 rounded-full border-4 border-white dark:border-[#1E293B] shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4">
                    {selectedEmployee.photoUrl ? (
                      <img src={selectedEmployee.photoUrl} alt="Employee ID" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400"><User className="w-12 h-12" /></div>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center md:text-left">{selectedEmployee.fullName}</h2>
                  <p className="text-sm font-mono text-[#0EA5E9] mb-4">{selectedEmployee.employeeId}</p>
                  
                  <div className="w-full space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-[#94A3B8]">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      {selectedEmployee.jobTitle || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-[#94A3B8]">
                      <Building className="w-4 h-4 text-slate-400" />
                      {selectedEmployee.department || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Detailed HR Data Column */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  <div className="bg-slate-50 dark:bg-[#131B2B] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contact Information</h4>
                    <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                      <div className="flex items-start gap-2"><Mail className="w-4 h-4 text-slate-400 mt-0.5" /> <span className="break-all">{selectedEmployee.officialEmail}</span></div>
                      <div className="flex items-start gap-2"><Phone className="w-4 h-4 text-slate-400 mt-0.5" /> {selectedEmployee.phone || 'N/A'}</div>
                      <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-slate-400 mt-0.5" /> <span>{selectedEmployee.address || 'N/A'}</span></div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#131B2B] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Personal Details</h4>
                    <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                      <div className="flex items-start gap-2"><Calendar className="w-4 h-4 text-slate-400 mt-0.5" /> {selectedEmployee.dob ? new Date(selectedEmployee.dob).toLocaleDateString() : 'N/A'}</div>
                      <div className="flex items-start gap-2"><Users className="w-4 h-4 text-slate-400 mt-0.5" /> {selectedEmployee.gender || 'N/A'}</div>
                      <div className="flex items-start gap-2"><FileText className="w-4 h-4 text-slate-400 mt-0.5" /> <span>{selectedEmployee.education || 'N/A'}</span></div>
                    </div>
                  </div>

                  <div className="bg-red-500/5 dark:bg-red-500/10 p-4 rounded-xl border border-red-500/20 sm:col-span-2">
                    <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" /> Emergency Contact
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700 dark:text-slate-300">
                      <div><span className="text-slate-400 text-xs block mb-1">Name</span> {selectedEmployee.emergencyContact?.name || 'N/A'}</div>
                      <div><span className="text-slate-400 text-xs block mb-1">Phone</span> {selectedEmployee.emergencyContact?.phone || 'N/A'}</div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-[#131B2B] border-t border-slate-200 dark:border-slate-800 flex justify-end gap-4">
              <button 
                onClick={() => handleReject(selectedEmployee._id)}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-500 font-bold rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" /> REJECT
              </button>
              <button 
                onClick={() => handleApprove(selectedEmployee._id)}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-lg shadow-lg shadow-green-500/20 transition-colors"
              >
                <CheckCircle className="w-5 h-5" /> APPROVE ACCESS
              </button>
            </div>

          </div>
        </div>
      )}

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

        {/* User & Employee Management */}
        <div className="mt-8 space-y-8">
          
          {/* Pending Approvals */}
          <div id="employee-approvals">
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
                      <th className="px-6 py-4 font-bold">Job Title</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-700 dark:text-[#E2E8F0] divide-y divide-slate-100 dark:divide-[#1E293B]">
                    {pendingEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500 dark:text-[#94A3B8]">No pending approvals.</td>
                      </tr>
                    ) : (
                      pendingEmployees.map((emp) => (
                        <tr key={emp._id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/50 transition-colors">
                          <td className="px-6 py-4 font-semibold flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                              {emp.photoUrl ? (
                                <img src={emp.photoUrl} alt="ID" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 m-1.5 text-slate-400" />
                              )}
                            </div>
                            {emp.fullName}
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-[#94A3B8]">{emp.officialEmail}</td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">{emp.jobTitle || 'N/A'}</td>
                          <td className="px-6 py-4 flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setSelectedEmployee(emp)}
                              className="px-4 py-2 bg-[#0EA5E9]/10 hover:bg-[#0EA5E9]/20 text-[#0EA5E9] font-bold rounded-lg transition-colors flex items-center gap-2 text-xs"
                            >
                              <Eye className="w-4 h-4" /> View Full Profile
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
        
      </div>
    </div>
  );
};

export default AdminPanel;
