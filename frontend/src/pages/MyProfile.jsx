import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Briefcase, Building, Edit, Save, X, ShieldAlert, CheckCircle } from 'lucide-react';

const MyProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || user.fullName || '',
        phone: user.phone || '',
        jobTitle: user.jobTitle || '',
        department: user.department || ''
      });
      if (user.pendingProfileUpdates) {
        setIsPending(true);
        setMessage({ type: 'warning', text: 'Your requested changes have been sent to the System Administrator for security clearance.' });
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('depthfence_token');
      const response = await axios.put(`${API_URL}/api/users/profile/${user._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.status === 'pending') {
        setIsPending(true);
        setMessage({ type: 'warning', text: 'Your requested changes have been sent to the System Administrator for security clearance.' });
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully.' });
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    }
  };

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex-1 overflow-y-auto p-8 font-sans bg-slate-50 dark:bg-[#0B0F17]">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-white mb-8">
          <User className="w-8 h-8 text-[#0EA5E9]" />
          My Profile
        </h1>

        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'warning' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : message.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
            {message.type === 'warning' ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Personal Information</h2>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                disabled={isPending}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${isPending ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500' : 'bg-[#0EA5E9]/10 text-[#0EA5E9] hover:bg-[#0EA5E9]/20'}`}
              >
                <Edit className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#131B2B] border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#0EA5E9]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#131B2B] border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#0EA5E9]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Job Title</label>
                  <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#131B2B] border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#0EA5E9]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Department</label>
                  <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#131B2B] border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#0EA5E9]" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-[#0EA5E9]/20">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Full Name</div>
                  <div className="font-semibold text-slate-900 dark:text-white">{user.name || user.fullName || 'N/A'}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Official Email</div>
                  <div className="font-semibold text-slate-900 dark:text-white">{user.email || user.officialEmail || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Phone Number</div>
                  <div className="font-semibold text-slate-900 dark:text-white">{user.phone || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Job Title</div>
                  <div className="font-semibold text-slate-900 dark:text-white">{user.jobTitle || 'N/A'}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Department</div>
                  <div className="font-semibold text-slate-900 dark:text-white">{user.department || 'N/A'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
