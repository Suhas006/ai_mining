import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLiveData } from '../context/LiveDataContext';
import { User, Activity, Map, Box, ShieldCheck, Mail, Clock, Database } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { totalScans, ulpinsMinted, auditLogs } = useLiveData();

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-[#0B0F17]">
        <div className="text-slate-500 dark:text-[#94A3B8]">Please login to view your profile.</div>
      </div>
    );
  }

  const userLogins = auditLogs.filter(log => log.user === user.email && log.event === 'System Login').length;

  return (
    <div className="flex-1 overflow-y-auto p-8 relative font-sans">
      <div className="max-w-5xl mx-auto z-10 relative space-y-8">
        
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
            <User className="w-8 h-8 text-[#0EA5E9]" />
            Operator Profile
          </h1>
          <p className="text-slate-500 dark:text-[#94A3B8] mt-2">Manage your identity and view your operational statistics.</p>
        </div>

        {/* User Identity Card */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-sm dark:shadow-none dark:backdrop-blur-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-[-50%] right-[-10%] w-[30%] h-[150%] bg-[#0EA5E9]/10 blur-[100px] pointer-events-none"></div>
          
          {/* Avatar Placeholder */}
          <div className="w-32 h-32 rounded-full border-4 border-slate-100 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0F172A] flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.15)] z-10">
            <User className="w-12 h-12 text-slate-400 dark:text-[#475569]" />
          </div>
          
          <div className="flex-1 z-10 text-center md:text-left space-y-4">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{user.name}</h2>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                <span className="px-3 py-1 bg-[#0EA5E9]/10 dark:bg-[#0EA5E9]/20 text-[#0EA5E9] text-xs font-mono font-bold uppercase rounded-full border border-[#0EA5E9]/30">
                  {user.role}
                </span>
                <span className="px-3 py-1 bg-[#10B981]/10 text-[#10B981] text-xs font-mono font-bold uppercase rounded-full border border-[#10B981]/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 pt-4 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-slate-500 dark:text-[#94A3B8]">
                <Mail className="w-4 h-4 text-slate-400 dark:text-[#475569]" />
                {user.email}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-slate-500 dark:text-[#94A3B8]">
                <Clock className="w-4 h-4 text-slate-400 dark:text-[#475569]" />
                Joined: Oct 2025
              </div>
            </div>
          </div>
        </div>

        {/* Operational Statistics Grid */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Operational Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Stat Card 1 */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] rounded-xl p-6 transition-all hover:border-[#0EA5E9]/50 shadow-sm dark:shadow-none hover:shadow-[0_0_15px_rgba(14,165,233,0.1)]">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center text-[#0EA5E9]">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="text-slate-500 dark:text-[#94A3B8] text-sm font-medium mb-1">Total System Logins</div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono">{userLogins}</div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] rounded-xl p-6 transition-all hover:border-[#F97316]/50 shadow-sm dark:shadow-none hover:shadow-[0_0_15px_rgba(249,115,22,0.1)]">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#F97316]/10 flex items-center justify-center text-[#F97316]">
                  <Map className="w-5 h-5" />
                </div>
              </div>
              <div className="text-slate-500 dark:text-[#94A3B8] text-sm font-medium mb-1">Total Aerial Scans</div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono">{totalScans}</div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] rounded-xl p-6 transition-all hover:border-[#10B981]/50 shadow-sm dark:shadow-none hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                  <Box className="w-5 h-5" />
                </div>
              </div>
              <div className="text-slate-500 dark:text-[#94A3B8] text-sm font-medium mb-1">3D ULPINs Minted</div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono">{ulpinsMinted}</div>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Profile;
