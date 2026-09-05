import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLiveData } from '../context/LiveDataContext';
import { ShieldAlert, Users, Server, Globe, AlertTriangle, Terminal, Lock, Download, Map as MapIcon, Box } from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  const { auditLogs, totalScans, ulpinsMinted } = useLiveData();

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
        
      </div>
    </div>
  );
};

export default AdminPanel;
