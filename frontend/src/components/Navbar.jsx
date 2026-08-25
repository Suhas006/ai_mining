import React from 'react';
import { Shield, MapPin, Cpu, Smartphone, AlertTriangle, Radio, Sun, Moon, Lock, UserCheck } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpen3DPit,
  onOpenRegister,
  onOpenAIAnalyzer,
  onOpenFieldSim,
  onOpenAuth,
  anomalyCount,
  currentUser,
  isDaytimeMode,
  onToggleTheme
}) {
  const officerName = currentUser?.name || 'R. Raman';
  const officerRole = currentUser?.role || 'District Mining Officer';
  const employeeId = currentUser?.employeeId || 'TN-MIN-8472';
  const zone = currentUser?.jurisdiction || 'Karur Zone';

  return (
    <header className={`${isDaytimeMode ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-[#0B0F17] border-[#1E293B] text-white'} border-b sticky top-0 z-50 px-4 py-3 shadow-xl transition-colors`}>
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        
        {/* TOP ROW: Brand & Profile / Global Actions */}
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Header */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center text-[#0EA5E9] shrink-0 shadow-inner">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">GEOSURAKSHA</h1>
                <span className="bg-[#0EA5E9]/20 text-[#0EA5E9] text-[10px] font-mono px-2 py-0.5 rounded border border-[#0EA5E9]/30 uppercase tracking-wider font-bold whitespace-nowrap shadow-sm">
                  GOVT GRID v2
                </span>
              </div>
              <p className={`text-[11px] font-medium tracking-wide ${isDaytimeMode ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
                Unified 3D ULPIN & Mining Encroachment Interceptor
              </p>
            </div>
          </div>

          {/* Right Side Actions: Theme, Auth, Profile Widget */}
          <div className="flex items-center gap-4 shrink-0">
            
            {/* Global Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0EA5E9]/10 text-[#0EA5E9] hover:bg-[#0EA5E9]/20 border border-[#0EA5E9]/30 rounded-md text-xs font-bold transition-all shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                Clearance Portal
              </button>
              
              <button
                onClick={onToggleTheme}
                className={`p-1.5 rounded-md border transition-all ${isDaytimeMode ? 'bg-slate-200 border-slate-300 hover:bg-slate-300' : 'bg-[#131B2B] hover:bg-[#1E293B] border-[#1E293B]'}`}
                title={isDaytimeMode ? 'Switch to Dark GIS Mode' : 'Switch to Daytime Field Mode'}
              >
                {isDaytimeMode ? <Moon className="w-4 h-4 text-cyan-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>
            </div>

            {/* Profile Widget */}
            <div className={`flex items-center gap-3 pl-4 border-l ${isDaytimeMode ? 'border-slate-300' : 'border-[#1E293B]'}`}>
              <div className="text-right hidden sm:block whitespace-nowrap">
                <div className="text-xs font-bold flex items-center gap-1 justify-end">
                  <UserCheck className="w-3.5 h-3.5 text-[#10B981]" />
                  {officerName} <span className="opacity-80 font-normal">({officerRole.split(' ')[0]})</span>
                </div>
                <div className="text-[10px] font-mono text-[#0EA5E9] font-bold mt-0.5">
                  {employeeId} • {zone}
                </div>
                <div className={`text-[9px] font-mono mt-0.5 ${isDaytimeMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Last login: 25 Aug 2026, 09:14 AM (IP 192.168.1.104)
                </div>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#0EA5E9]/40 bg-[#131B2B] text-[#0EA5E9] font-bold text-sm shadow-md ring-2 ring-[#0EA5E9]/10">
                {officerName.split(' ').map(n => n[0]).join('').slice(0, 2) || 'RR'}
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className={`w-full h-px ${isDaytimeMode ? 'bg-slate-300' : 'bg-[#1E293B]'}`}></div>

        {/* BOTTOM ROW: Navigation Tabs & Tool Actions */}
        <div className="flex items-center justify-between overflow-x-auto pb-1 custom-scrollbar">
          
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('monitor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'monitor'
                  ? 'bg-[#0EA5E9] text-white shadow-md shadow-[#0EA5E9]/30'
                  : 'bg-transparent text-[#94A3B8] hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/10'
              }`}
            >
              <Radio className={`w-4 h-4 ${activeTab === 'monitor' ? 'animate-pulse text-white' : ''}`} />
              Live Orbit Monitor
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'map'
                  ? 'bg-[#0EA5E9] text-white shadow-md shadow-[#0EA5E9]/30'
                  : 'bg-transparent text-[#94A3B8] hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/10'
              }`}
            >
              <MapPin className="w-4 h-4" />
              GIS Map View
            </button>

            <button
              onClick={() => setActiveTab('triage')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap relative ${
                activeTab === 'triage'
                  ? 'bg-[#EF4444] text-white shadow-md shadow-[#EF4444]/30'
                  : 'bg-transparent text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Triage Queue
              {anomalyCount > 0 && (
                <span className={`text-[10px] font-black rounded-full px-1.5 py-0.5 ml-1 ${activeTab === 'triage' ? 'bg-white text-[#EF4444]' : 'bg-[#EF4444] text-white animate-pulse'}`}>
                  {anomalyCount}
                </span>
              )}
            </button>
          </div>

          {/* Module Actions / Tools */}
          <div className="flex items-center gap-2 shrink-0 border-l pl-3 ml-3 border-dashed border-slate-500/30">
            <button
              onClick={onOpen3DPit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#131B2B] hover:bg-[#1E293B] text-[#0EA5E9] border border-[#1E293B] rounded-md text-[11px] font-bold transition-all whitespace-nowrap shadow-sm"
            >
              📦 3D Terrain & Pit Depth
            </button>

            <button
              onClick={onOpenRegister}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 rounded-md text-[11px] font-bold transition-all whitespace-nowrap"
            >
              + Register Parcel (ULPIN)
            </button>

            <button
              onClick={onOpenAIAnalyzer}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30 rounded-md text-[11px] font-bold transition-all whitespace-nowrap"
            >
              <Cpu className="w-3.5 h-3.5" />
              AI Satellite Interceptor
            </button>

            <button
              onClick={onOpenFieldSim}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/30 rounded-md text-[11px] font-bold transition-all whitespace-nowrap"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Field App Sync
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
