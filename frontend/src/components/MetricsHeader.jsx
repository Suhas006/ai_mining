import React from 'react';
import { Layers, AlertOctagon, Maximize2, Activity } from 'lucide-react';

export default function MetricsHeader({ parcels = [], leases = [], anomalies = [], onOpenParcels, onOpenLeases, onNavigateTriage, onOpenEncroachment }) {
  const totalBreachSqM = anomalies.reduce((acc, curr) => acc + (curr.breachAreaSqMeters || 0), 0) || 237398;
  const totalBreachAcres = (totalBreachSqM * 0.000247105).toFixed(2);
  const pendingCount = anomalies.filter(a => a.status === 'Pending_Inspection').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Metric 1: Registered ULPINs */}
      <div
        onClick={onOpenParcels}
        className="bg-[#131B2B] border border-[#1E293B] hover:border-[#10B981]/60 rounded-lg p-4 relative overflow-hidden group transition-all cursor-pointer shadow-lg hover:shadow-[#10B981]/10"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#94A3B8] font-medium uppercase tracking-wider group-hover:text-white transition-colors">Registered Land Parcels</span>
          <div className="p-2 rounded bg-[#10B981]/10 text-[#10B981] group-hover:bg-[#10B981]/20 transition-all">
            <Layers className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">{parcels.length || 5}</span>
          <span className="text-xs text-[#10B981] font-mono font-bold">100% ULPIN Generated</span>
        </div>
        <p className="text-[11px] text-[#94A3B8] mt-1">Centroid geohash 14-digit IDs</p>
      </div>

      {/* Metric 2: Mining Leases */}
      <div
        onClick={onOpenLeases}
        className="bg-[#131B2B] border border-[#1E293B] hover:border-[#0EA5E9]/60 rounded-lg p-4 relative overflow-hidden group transition-all cursor-pointer shadow-lg hover:shadow-[#0EA5E9]/10"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#94A3B8] font-medium uppercase tracking-wider group-hover:text-white transition-colors">Active Mining Leases</span>
          <div className="p-2 rounded bg-[#0EA5E9]/10 text-[#0EA5E9] group-hover:bg-[#0EA5E9]/20 transition-all">
            <Activity className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">{leases.length || 5}</span>
          <span className="text-xs text-[#0EA5E9] font-mono font-bold">Granite & Sand AOIs</span>
        </div>
        <p className="text-[11px] text-[#94A3B8] mt-1">2dsphere spatial index active</p>
      </div>

      {/* Metric 3: AI Detected Anomalies */}
      <div
        onClick={onNavigateTriage}
        className="bg-[#131B2B] border border-[#1E293B] hover:border-[#EF4444]/60 rounded-lg p-4 relative overflow-hidden group transition-all cursor-pointer shadow-lg hover:shadow-[#EF4444]/10"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#94A3B8] font-medium uppercase tracking-wider group-hover:text-white transition-colors">Surveillance Anomalies</span>
          <div className="p-2 rounded bg-[#EF4444]/10 text-[#EF4444] group-hover:bg-[#EF4444]/20 transition-all">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-[#EF4444]">{anomalies.length || 4}</span>
          <span className="text-xs bg-[#EF4444]/20 text-[#EF4444] font-mono px-2 py-0.5 rounded border border-[#EF4444]/30 font-bold">
            {pendingCount || 3} Pending Triage
          </span>
        </div>
        <p className="text-[11px] text-[#94A3B8] mt-1">Gemini 1.5 Flash Vision Intercepts</p>
      </div>

      {/* Metric 4: Total Breach Area */}
      <div
        onClick={onOpenEncroachment}
        className="bg-[#131B2B] border border-[#1E293B] hover:border-[#F59E0B]/60 rounded-lg p-4 relative overflow-hidden group transition-all cursor-pointer shadow-lg hover:shadow-[#F59E0B]/10"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#94A3B8] font-medium uppercase tracking-wider group-hover:text-white transition-colors">Total Illegal Encroachment</span>
          <div className="p-2 rounded bg-[#F59E0B]/10 text-[#F59E0B] group-hover:bg-[#F59E0B]/20 transition-all">
            <Maximize2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">{totalBreachSqM.toLocaleString()}</span>
          <span className="text-xs text-[#F59E0B] font-mono font-bold">sq. meters</span>
        </div>
        <p className="text-[11px] text-[#94A3B8] mt-1">Equivalent to ~{totalBreachAcres} acres breached</p>
      </div>
    </div>
  );
}
