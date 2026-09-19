import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, Users, AlertTriangle, Trash2, Eye, X, Phone, MapPin, Briefcase, Calendar, Stethoscope, Mail, Building, User, CheckCircle, XCircle 
} from 'lucide-react';

const EmployeeDirectory = () => {
  const { user } = useAuth();
  
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    actionType: null, 
    targetId: null, 
    title: '', 
    message: '', 
    confirmText: '' 
  });

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

  const handleApproveProfile = async (id) => {
    try {
      const token = localStorage.getItem('depthfence_token');
      await axios.put(`${API_URL}/api/admin/profile-requests/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchManagementData();
    } catch (err) {
      console.error('Approval failed', err);
    }
  };

  const handleRejectProfile = async (id) => {
    try {
      const token = localStorage.getItem('depthfence_token');
      await axios.put(`${API_URL}/api/admin/profile-requests/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchManagementData();
    } catch (err) {
      console.error('Rejection failed', err);
    }
  };

  const handleConfirmAction = async () => {
    try {
      const token = localStorage.getItem('depthfence_token');
      if (confirmDialog.actionType === 'DELETE') {
        await axios.delete(`${API_URL}/api/admin/users/${confirmDialog.targetId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActiveUsers(prev => prev.filter(u => u._id !== confirmDialog.targetId));
        setPendingEmployees(prev => prev.filter(u => u._id !== confirmDialog.targetId));
        setSelectedEmployee(prev => (prev && prev._id === confirmDialog.targetId) ? null : prev);
      } else if (confirmDialog.actionType === 'REJECT') {
        await axios.post(`${API_URL}/api/admin/employees/${confirmDialog.targetId}/reject`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSelectedEmployee(null);
        fetchManagementData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmDialog({ isOpen: false, actionType: null, targetId: null, title: '', message: '', confirmText: '' });
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
          You do not have the required security clearance to access the DepthFence Employee Directory. Your access attempt has been logged.
        </p>
      </div>
    );
  }

  const renderEmployeeProfile = (emp) => (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Photo & Basic Info Column */}
        <div className="flex flex-col items-center md:items-start md:w-1/3">
          <div className="w-40 h-40 rounded-full border-4 border-white dark:border-[#1E293B] shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4">
            {emp.photoUrl ? (
              <img src={emp.photoUrl} alt="Employee ID" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400"><User className="w-12 h-12" /></div>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center md:text-left">{emp.fullName}</h2>
          <p className="text-sm font-mono text-[#0EA5E9] mb-4">{emp.employeeId}</p>
          
          <div className="w-full space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-[#94A3B8]">
              <Briefcase className="w-4 h-4 text-slate-400" />
              {emp.jobTitle || 'N/A'}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-[#94A3B8]">
              <Building className="w-4 h-4 text-slate-400" />
              {emp.department || 'N/A'}
            </div>
          </div>
        </div>

        {/* Detailed HR Data Column */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <div className="bg-slate-50 dark:bg-[#131B2B] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contact Information</h4>
            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2"><Mail className="w-4 h-4 text-slate-400 mt-0.5" /> <span className="break-all">{emp.officialEmail}</span></div>
              <div className="flex items-start gap-2"><Phone className="w-4 h-4 text-slate-400 mt-0.5" /> {emp.phone || 'N/A'}</div>
              <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-slate-400 mt-0.5" /> <span>{emp.address || 'N/A'}</span></div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#131B2B] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Personal Details</h4>
            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2"><Calendar className="w-4 h-4 text-slate-400 mt-0.5" /> {emp.dob ? new Date(emp.dob).toLocaleDateString() : 'N/A'}</div>
              <div className="flex items-start gap-2"><Users className="w-4 h-4 text-slate-400 mt-0.5" /> {emp.gender || 'N/A'}</div>
              <div className="flex items-start gap-2"><Briefcase className="w-4 h-4 text-slate-400 mt-0.5" /> <span>{emp.education || 'N/A'}</span></div>
            </div>
          </div>

          <div className="bg-red-500/5 dark:bg-red-500/10 p-4 rounded-xl border border-red-500/20 sm:col-span-2">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4" /> Emergency Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700 dark:text-slate-300">
              <div><span className="text-slate-400 text-xs block mb-1">Name</span> {emp.emergencyContact?.name || 'N/A'}</div>
              <div><span className="text-slate-400 text-xs block mb-1">Phone</span> {emp.emergencyContact?.phone || 'N/A'}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  const renderStandardUserProfile = (u) => (
    <div className="flex-1 overflow-y-auto p-12 flex flex-col items-center justify-center text-center">
      <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center mb-6 shadow-xl">
        <User className="w-16 h-16 text-slate-400" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{u.fullName}</h2>
      <p className="text-lg text-slate-500 dark:text-[#94A3B8] mb-8 flex items-center gap-2 justify-center">
        <Mail className="w-5 h-5" /> {u.officialEmail}
      </p>
      
      <div className="flex gap-4 items-center justify-center">
        <span className="px-5 py-2 bg-[#0EA5E9]/10 text-[#0EA5E9] font-bold uppercase tracking-widest text-sm rounded-full border border-[#0EA5E9]/30">
          Standard User
        </span>
        <span className={`px-5 py-2 font-bold uppercase tracking-widest text-sm rounded-full border ${u.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30'}`}>
          {u.status}
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 relative font-sans">
      
      {/* -------------------- DYNAMIC CONFIRMATION MODAL -------------------- */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[4000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-md rounded-2xl shadow-2xl p-6 border border-red-500/20 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{confirmDialog.title}</h3>
            <p className="text-slate-500 dark:text-[#94A3B8] mb-6 text-sm">{confirmDialog.message}</p>
            <div className="flex w-full gap-3">
              <button 
                onClick={() => setConfirmDialog({ isOpen: false, actionType: null, targetId: null, title: '', message: '', confirmText: '' })}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmAction}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-lg shadow-red-500/20 transition-colors"
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- EMPLOYEE PROFILE MODAL -------------------- */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#131B2B]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0EA5E9]" />
                {selectedEmployee.registrationType === 'Employee' ? 'Employee Profile' : 'User Profile'}
                {selectedEmployee.status === 'Pending' && <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full ml-2">Pending Approval</span>}
              </h3>
              <button onClick={() => setSelectedEmployee(null)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedEmployee.registrationType === 'Employee' 
              ? renderEmployeeProfile(selectedEmployee)
              : renderStandardUserProfile(selectedEmployee)}

            {(selectedEmployee.status === 'Pending' || selectedEmployee.status === 'reactivation_pending' || selectedEmployee.isReactivationRequested) && (
              <div className="px-6 py-4 bg-slate-50 dark:bg-[#131B2B] border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                {selectedEmployee.isReactivationRequested && (
                  <div className="bg-red-900/50 border border-red-500 text-red-200 text-xs p-2 rounded mb-2">
                    ⚠️ You removed this user previously. Would you like to add them back?
                  </div>
                )}
                <div className="flex justify-end gap-4">
                  <button 
                    onClick={() => setConfirmDialog({ isOpen: true, actionType: 'REJECT', targetId: selectedEmployee._id, title: 'Reject Clearance', message: 'Are you sure you want to reject this request?', confirmText: 'Reject Request' })}
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
            )}
            
            {selectedEmployee.status === 'Active' && (
              <div className="px-6 py-4 bg-slate-50 dark:bg-[#131B2B] border-t border-slate-200 dark:border-slate-800 flex justify-end gap-4">
                <button 
                  onClick={() => setConfirmDialog({ isOpen: true, actionType: 'DELETE', targetId: selectedEmployee._id, title: 'Confirm Deletion', message: 'Are you absolutely sure you want to permanently delete this user? This action cannot be undone.', confirmText: 'Permanently Delete' })}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-500 font-bold rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" /> {selectedEmployee.registrationType === 'Employee' ? 'REVOKE ACCESS' : 'DELETE USER'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto z-10 relative space-y-8">
        
        {/* Page Header */}
        <div className="border-b border-[#0EA5E9]/20 pb-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-[#0EA5E9]/10 dark:bg-[#0EA5E9]/20 text-[#0EA5E9] text-xs font-mono font-bold uppercase rounded-full border border-[#0EA5E9]/30 flex items-center gap-2">
              <Users className="w-4 h-4" />
              HR DIRECTORY
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Employee Directory & Approvals</h1>
          <p className="text-[#0EA5E9] dark:text-[#0EA5E9]/70 mt-2 font-mono text-sm">Manage Active Directory & Pending Clearances</p>
        </div>

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
                      <React.Fragment key={emp._id}>
                        <tr onClick={() => setSelectedEmployee(emp)} className={`hover:bg-slate-50 dark:hover:bg-[#1E293B]/50 transition-colors cursor-pointer group ${emp.isReactivationRequested ? 'border-l-4 border-l-red-500 bg-red-500/5 dark:bg-red-900/10' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="font-semibold flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                  {emp.photoUrl ? (
                                    <img src={emp.photoUrl} alt="ID" className="w-full h-full object-cover" />
                                  ) : (
                                    <User className="w-5 h-5 m-1.5 text-slate-400" />
                                  )}
                                </div>
                                {emp.fullName}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-[#94A3B8]">{emp.officialEmail}</td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">{emp.jobTitle || 'N/A'}</td>
                          <td className="px-6 py-4 flex items-center justify-end gap-2">
                            <button 
                              className="px-4 py-2 bg-[#0EA5E9]/10 group-hover:bg-[#0EA5E9]/20 text-[#0EA5E9] font-bold rounded-lg transition-colors flex items-center gap-2 text-xs"
                            >
                              <Eye className="w-4 h-4" /> View Profile
                            </button>
                            {(emp.status === 'pending' || emp.status === 'Pending' || emp.status === 'reactivation_pending' || emp.isReactivationRequested) && (
                              <div className="flex gap-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleApprove(emp._id); }}
                                  className="px-3 py-1.5 bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] font-bold rounded flex items-center gap-1 text-xs transition-colors"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setConfirmDialog({ isOpen: true, actionType: 'REJECT', targetId: emp._id, title: 'Reject Clearance', message: 'Are you sure you want to reject this request?', confirmText: 'Reject Request' }); }}
                                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 font-bold rounded flex items-center gap-1 text-xs transition-colors"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                        {emp.isReactivationRequested && (
                          <tr className="bg-red-500/5 dark:bg-red-900/10 border-l-4 border-l-red-500 border-b border-b-slate-100 dark:border-b-[#1E293B]">
                            <td colSpan="4" className="px-6 pb-4 pt-1">
                              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2 shadow-sm">
                                ⚠️ You removed this user. Would you like to add them back?
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Active Directory */}
        <div className="mt-8">
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
                      <tr key={u._id} onClick={() => setSelectedEmployee(u)} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/50 transition-colors cursor-pointer group">
                        <td className="px-6 py-4 font-semibold flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                            {u.photoUrl ? (
                              <img src={u.photoUrl} alt="ID" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 m-1.5 text-slate-400" />
                            )}
                          </div>
                          {u.fullName}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-[#94A3B8]">{u.officialEmail}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                            {u.registrationType || 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex items-center justify-end gap-2">
                          <button 
                            className="px-4 py-2 bg-[#0EA5E9]/10 group-hover:bg-[#0EA5E9]/20 text-[#0EA5E9] font-bold rounded-lg transition-colors flex items-center gap-2 text-xs"
                          >
                            <Eye className="w-4 h-4" /> View Profile
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setConfirmDialog({ isOpen: true, actionType: 'DELETE', targetId: u._id, title: 'Confirm Deletion', message: 'Are you absolutely sure you want to permanently delete this user? This action cannot be undone.', confirmText: 'Permanently Delete' }); }}
                            className="px-4 py-2 bg-red-500/10 group-hover:bg-red-500/20 text-red-600 dark:text-red-500 font-bold rounded-lg transition-colors flex items-center gap-2 text-xs"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
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

        {/* Pending Profile Updates */}
        {activeUsers.filter(u => u.pendingProfileUpdates).length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Pending Profile Updates
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeUsers.filter(u => u.pendingProfileUpdates).map(u => (
                <div key={u._id} className="bg-white dark:bg-[#131B2B] border border-amber-500/20 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{u.fullName}</h4>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{u.officialEmail}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                    {Object.keys(u.pendingProfileUpdates).map(key => (
                      <div key={key} className="flex flex-col text-sm">
                        <span className="font-semibold text-slate-600 dark:text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-red-500 line-through bg-red-500/10 px-2 py-0.5 rounded">{u[key] || 'N/A'}</span>
                          <span className="text-slate-400">➔</span>
                          <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded">{u.pendingProfileUpdates[key] || 'N/A'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => handleApproveProfile(u._id)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors text-sm shadow-lg shadow-green-500/20">
                      <CheckCircle className="w-4 h-4" /> Approve Changes
                    </button>
                    <button onClick={() => handleRejectProfile(u._id)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 font-bold rounded-lg transition-colors text-sm">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default EmployeeDirectory;
