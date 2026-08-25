import React from 'react';
import { Maximize2, ShieldAlert, AlertTriangle, Download, TrendingUp } from 'lucide-react';

export default function EncroachmentDetailModal({ anomalies = [], isOpen, onClose, onNavigateTriage }) {
  if (!isOpen) return null;

  const totalBreachSqM = anomalies.reduce((acc, curr) => acc + (curr.breachAreaSqMeters || 0), 0) || 237398;
  const totalBreachAcres = (totalBreachSqM * 0.000247105).toFixed(2);
  
  // Volumetric math: 17m avg depth past floor, 2.5 sp.gr granite, ₹2,500/ton fine
  const totalVolumeM3 = Math.round(totalBreachSqM * 17); // ~4,035,766 m3
  const totalTonnage = Math.round(totalVolumeM3 * 2.5); // ~10,089,415 Metric Tons
  const totalPenaltyCr = ((totalTonnage * 2500) / 10000000).toFixed(2); // ~₹2,522.35 Cr

  const districtBreakdown = [
    { district: 'Karur Black Granite Zone', breachSqM: 120049, acres: 29.66, volumeM3: 2040833, penaltyCr: '₹510.21 Cr', severity: 'Critical' },
    { district: 'Salem Magnesite Belt', breachSqM: 62000, acres: 15.32, volumeM3: 1054000, penaltyCr: '₹263.50 Cr', severity: 'Critical' },
    { district: 'Hosur Industrial Granite Sector', breachSqM: 35000, acres: 8.65, volumeM3: 595000, penaltyCr: '₹148.75 Cr', severity: 'High' },
    { district: 'Madurai Melur Granite Sector', breachSqM: 20349, acres: 5.03, volumeM3: 345933, penaltyCr: '₹86.48 Cr', severity: 'High' }
  ];

  return (
    <div className="fixed inset-0 z-[5000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#131B2B] border-2 border-[#F59E0B]/50 rounded-xl max-w-4xl w-full p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#F59E0B]/15 border border-[#F59E0B]/40 rounded-lg text-[#F59E0B]">
              <Maximize2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Volumetric Encroachment & Financial Penalty Analytics</h2>
                <span className="bg-[#F59E0B]/20 text-[#F59E0B] text-[10px] font-mono px-2 py-0.5 rounded border border-[#F59E0B]/40 font-bold uppercase">
                  STATEWIDE TAMIL NADU CADASTRE
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">3D Geospatial Earth Removal & Compounding Legal Restitution Demand</p>
            </div>
          </div>

          <button onClick={onClose} className="text-white bg-[#F59E0B] hover:bg-[#D97706] text-xs font-bold px-4 py-2 rounded shadow transition-all">
            ✕ Close Analytics
          </button>
        </div>

        {/* Top Summary Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0B0F17] border border-[#1E293B] p-4 rounded-lg">
            <span className="text-[11px] text-[#94A3B8] font-mono block">TOTAL ENCROACHED SURFACE AREA</span>
            <span className="text-xl font-bold font-mono text-white block mt-1">{totalBreachSqM.toLocaleString()} sq.m</span>
            <span className="text-xs text-[#F59E0B] font-mono font-bold">~{totalBreachAcres} Acres Flagged</span>
          </div>

          <div className="bg-[#0B0F17] border border-[#1E293B] p-4 rounded-lg">
            <span className="text-[11px] text-[#94A3B8] font-mono block">3D EXCAVATED PIT VOLUME</span>
            <span className="text-xl font-bold font-mono text-white block mt-1">{totalVolumeM3.toLocaleString()} m³</span>
            <span className="text-xs text-[#0EA5E9] font-mono font-bold">{totalTonnage.toLocaleString()} Metric Tons</span>
          </div>

          <div className="bg-[#0B0F17] border border-[#EF4444]/40 p-4 rounded-lg">
            <span className="text-[11px] text-[#EF4444] font-mono font-bold block">TOTAL STATE PENALTY DEMAND</span>
            <span className="text-2xl font-bold font-mono text-[#EF4444] block mt-1">₹{totalPenaltyCr} Cr</span>
            <span className="text-[11px] text-[#94A3B8] font-mono">Statutory Rate: ₹2,500/ton</span>
          </div>
        </div>

        {/* District Breakdown Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">District-by-District Breach & Fine Breakdown</h3>
          
          <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#0B0F17] text-[#F59E0B] uppercase">
                  <th className="p-3">Surveillance Sector / District</th>
                  <th className="p-3">Breach Surface Area</th>
                  <th className="p-3">3D Pit Volume</th>
                  <th className="p-3">Compounding Penalty</th>
                  <th className="p-3">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
                {districtBreakdown.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#0B0F17]/60 transition-colors">
                    <td className="p-3 font-bold text-white">{row.district}</td>
                    <td className="p-3 font-bold text-[#F59E0B]">{row.breachSqM.toLocaleString()} sq.m ({row.acres} acres)</td>
                    <td className="p-3 text-white font-bold">{row.volumeM3.toLocaleString()} m³</td>
                    <td className="p-3 font-bold text-[#EF4444] text-sm">{row.penaltyCr}</td>
                    <td className="p-3">
                      <span className="bg-[#EF4444]/20 text-[#EF4444] px-2 py-0.5 rounded text-[10px] font-bold border border-[#EF4444]/30 uppercase">
                        {row.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between bg-[#0B0F17] border border-[#1E293B] p-3 rounded-lg">
          <span className="text-xs text-[#94A3B8]">Review individual incident tickets in the Triage Queue for PDF legal dispatch.</span>
          <button
            onClick={() => {
              onClose();
              if (onNavigateTriage) onNavigateTriage();
            }}
            className="bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold px-4 py-2 rounded shadow transition-all flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4" />
            Open Incident Triage Queue
          </button>
        </div>
      </div>
    </div>
  );
}
