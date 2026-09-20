import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, List, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function StandardUserDashboard() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'list'
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    contactNumber: user?.phone || '',
    governmentId: '',
    propertyDetails: {
      type: 'Agricultural',
      address: '',
      surveyNumber: '',
      areaAffected: ''
    },
    encroacherDetails: {
      name: '',
      contact: '',
      relationship: ''
    },
    complaintDetails: {
      dateNoticed: '',
      description: '',
      policeIntervention: false
    }
  });
  
  const [submitStatus, setSubmitStatus] = useState({ loading: false, error: null, success: false });
  const [myGrievances, setMyGrievances] = useState([]);
  const [loadingGrievances, setLoadingGrievances] = useState(false);

  const fetchGrievances = async () => {
    setLoadingGrievances(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/complaints/my-grievances`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyGrievances(data.complaints || []);
      }
    } catch (err) {
      console.error('Failed to fetch grievances:', err);
    } finally {
      setLoadingGrievances(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') {
      fetchGrievances();
    }
  }, [activeTab]);

  const handleNestedChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, error: null, success: false });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/complaints/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit complaint');
      
      setSubmitStatus({ loading: false, error: null, success: true });
      // Reset form
      setFormData({
        ...formData,
        governmentId: '',
        propertyDetails: { type: 'Agricultural', address: '', surveyNumber: '', areaAffected: '' },
        encroacherDetails: { name: '', contact: '', relationship: '' },
        complaintDetails: { dateNoticed: '', description: '', policeIntervention: false }
      });
      
      setTimeout(() => setSubmitStatus(prev => ({ ...prev, success: false })), 5000);
    } catch (err) {
      setSubmitStatus({ loading: false, error: err.message, success: false });
    }
  };

  const renderStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock, label: 'Pending' },
      'under_investigation': { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: AlertCircle, label: 'Investigating' },
      'resolved': { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle, label: 'Resolved' },
      'rejected': { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: AlertCircle, label: 'Rejected' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#0B0F17]">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Citizen Grievance Portal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit and track land encroachment complaints.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'new' 
                ? 'border-[#0EA5E9] text-[#0EA5E9]' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            File a New Complaint (FORM LC-01)
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'list' 
                ? 'border-[#0EA5E9] text-[#0EA5E9]' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <List className="w-4 h-4" />
            My Grievances
          </button>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-[#131B2B] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6">
          
          {activeTab === 'new' && (
            <form onSubmit={handleSubmit} className="space-y-8">
              {submitStatus.success && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-medium border border-green-200 dark:border-green-500/20">
                  Complaint submitted successfully! Your grievance is now being processed.
                </div>
              )}
              {submitStatus.error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-500/20">
                  {submitStatus.error}
                </div>
              )}

              {/* Section 1: Complainant Details */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">1. Complainant Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Number</label>
                    <input type="text" required value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Government ID (Aadhaar/PAN/Voter ID)</label>
                    <input type="text" required value={formData.governmentId} onChange={e => setFormData({...formData, governmentId: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  </div>
                </div>
              </div>

              {/* Section 2: Disputed Property */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">2. Disputed Property</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Property Type</label>
                    <select value={formData.propertyDetails.type} onChange={e => handleNestedChange('propertyDetails', 'type', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]">
                      <option value="Agricultural">Agricultural Land</option>
                      <option value="Residential">Residential Plot</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Government">Government / Public Land</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Survey / Patta Number</label>
                    <input type="text" value={formData.propertyDetails.surveyNumber} onChange={e => handleNestedChange('propertyDetails', 'surveyNumber', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Complete Address / Location</label>
                    <textarea required rows="2" value={formData.propertyDetails.address} onChange={e => handleNestedChange('propertyDetails', 'address', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Approx. Area Affected</label>
                    <input type="text" placeholder="e.g. 2 Acres, 1500 sqft" value={formData.propertyDetails.areaAffected} onChange={e => handleNestedChange('propertyDetails', 'areaAffected', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  </div>
                </div>
              </div>

              {/* Section 3: Encroacher Details */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">3. Encroacher Details (If Known)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                    <input type="text" value={formData.encroacherDetails.name} onChange={e => handleNestedChange('encroacherDetails', 'name', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact (Optional)</label>
                    <input type="text" value={formData.encroacherDetails.contact} onChange={e => handleNestedChange('encroacherDetails', 'contact', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Relationship / Organization</label>
                    <input type="text" placeholder="Neighbor, Mining Company, Unknown..." value={formData.encroacherDetails.relationship} onChange={e => handleNestedChange('encroacherDetails', 'relationship', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  </div>
                </div>
              </div>

              {/* Section 4: Incident Description */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">4. Incident Description</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date Noticed</label>
                    <input type="date" value={formData.complaintDetails.dateNoticed} onChange={e => handleNestedChange('complaintDetails', 'dateNoticed', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] max-w-xs" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Detailed Description of Issue</label>
                    <textarea required rows="4" placeholder="Describe how the encroachment occurred, current status, etc." value={formData.complaintDetails.description} onChange={e => handleNestedChange('complaintDetails', 'description', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="policeIntervention" checked={formData.complaintDetails.policeIntervention} onChange={e => handleNestedChange('complaintDetails', 'policeIntervention', e.target.checked)} className="w-4 h-4 text-[#0EA5E9] border-slate-300 rounded focus:ring-[#0EA5E9]" />
                    <label htmlFor="policeIntervention" className="text-sm text-slate-700 dark:text-slate-300">Police intervention was required / FIR filed</label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="submit" disabled={submitStatus.loading} className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                  {submitStatus.loading ? 'Submitting Form...' : 'Submit Grievance Form'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'list' && (
            <div className="space-y-4">
              {loadingGrievances ? (
                <div className="text-center py-10 text-slate-500">Loading your grievances...</div>
              ) : myGrievances.length === 0 ? (
                <div className="text-center py-10 text-slate-500">You haven't submitted any complaints yet.</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {myGrievances.map(grievance => (
                    <div key={grievance._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F17]">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">{grievance.propertyDetails.address}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Submitted on {new Date(grievance.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {renderStatusBadge(grievance.status)}
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-medium">Type:</span> {grievance.propertyDetails.type} Land <br />
                        <span className="font-medium">Description:</span> {grievance.complaintDetails.description.substring(0, 100)}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
