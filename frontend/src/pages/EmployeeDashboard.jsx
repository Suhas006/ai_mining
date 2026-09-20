import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Eye, Clock, User, Phone, Shield } from 'lucide-react';
import axios from 'axios';

export default function EmployeeDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingComplaints();
  }, []);

  const fetchPendingComplaints = async () => {
    setLoading(true);
    try {
      const rawUser = localStorage.getItem('user');
      const parsedUser = rawUser ? JSON.parse(rawUser) : null;
      const currentToken = localStorage.getItem('token') || parsedUser?.token || localStorage.getItem('jwt') || token;
      
      if (!currentToken) {
        console.error("JWT Token is missing from local storage.");
        setLoading(false);
        return;
      }
      
      const config = { headers: { Authorization: `Bearer ${currentToken}` } };
      const { data } = await axios.get('https://ai-mining.onrender.com/api/complaints/pending', config);
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('Failed to fetch pending complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const maskGovId = (id) => {
    if (!id || id.length < 4) return 'XXXX';
    return `XXXX-XXXX-${id.slice(-4)}`;
  };

  const handleInvestigate = (complaint) => {
    // Navigate to Z-Axis Analyzer (or similar mapping tool) with context
    // E.g., /2d-scanner or /3d-mapping. 
    // The requirement says "route the employee to the 3D Z-Axis Analyzer page (/z-axis-analyzer)"
    navigate(`/z-axis-analyzer?surveyNumber=${encodeURIComponent(complaint.propertyDetails.surveyNumber || '')}&address=${encodeURIComponent(complaint.propertyDetails.address || '')}`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#0B0F17]">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Field Surveyor Queue</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and investigate pending land encroachment complaints.</p>
        </div>

        {/* Complaints Queue */}
        <div className="bg-white dark:bg-[#131B2B] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1E293B]/50 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F59E0B]" />
              Pending Investigations ({complaints.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-[#0B0F17] text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3">Complainant</th>
                  <th className="px-4 py-3">Govt ID</th>
                  <th className="px-4 py-3">Property Info</th>
                  <th className="px-4 py-3">Date Noticed</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-500">Loading queue...</td>
                  </tr>
                ) : complaints.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-500">No pending complaints at this time.</td>
                  </tr>
                ) : (
                  complaints.map(complaint => (
                    <tr key={complaint._id} className="hover:bg-slate-50/50 dark:hover:bg-[#1E293B]/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-white">{complaint.fullName}</span>
                          <span className="text-xs flex items-center gap-1 text-slate-500">
                            <Phone className="w-3 h-3" /> {complaint.contactNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-mono text-xs">
                          <Shield className="w-3.5 h-3.5 text-slate-400" />
                          {maskGovId(complaint.governmentId)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col max-w-xs overflow-hidden">
                          <span className="font-medium text-slate-900 dark:text-white truncate" title={complaint.propertyDetails.address}>
                            {complaint.propertyDetails.address}
                          </span>
                          <span className="text-xs text-slate-500">
                            Survey No: {complaint.propertyDetails.surveyNumber || 'N/A'} • {complaint.propertyDetails.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {complaint.complaintDetails.dateNoticed ? new Date(complaint.complaintDetails.dateNoticed).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleInvestigate(complaint)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0EA5E9]/10 hover:bg-[#0EA5E9]/20 text-[#0EA5E9] font-medium rounded-lg transition-colors text-xs border border-[#0EA5E9]/20"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          Investigate
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
  );
}
