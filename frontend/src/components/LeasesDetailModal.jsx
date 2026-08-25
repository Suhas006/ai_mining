import React from 'react';
import { Activity, ShieldCheck, MapPin, AlertTriangle } from 'lucide-react';

export default function LeasesDetailModal({ leases = [], isOpen, onClose }) {
  if (!isOpen) return null;

  const defaultLeases = [
    {
      leaseId: 'TN-KRR-GRN-2024-009',
      leaseHolderName: 'Kaveri Black Granite Leases Ltd',
      mineralType: 'Black Granite',
      district: 'Karur District (Pugalur Belt)',
      permittedAreaSqM: 45200,
      permittedDepthM: 15,
      leaseExpiry: '2034-08-31',
      status: 'Active (Breach Flagged)'
    },
    {
      leaseId: 'TN-KRR-SND-2024-002',
      leaseHolderName: 'Amaravathi Sand Extraction Trust',
      mineralType: 'Riverbed Sand',
      district: 'Karur District (Amaravathi Riparian Zone)',
      permittedAreaSqM: 38400,
      permittedDepthM: 3,
      leaseExpiry: '2029-12-15',
      status: 'Active (Dredging Monitored)'
    },
    {
      leaseId: 'TN-SLM-MAG-2024-005',
      leaseHolderName: 'Salem Magnesite & Mineral Leases',
      mineralType: 'Magnesite & Dunite',
      district: 'Salem District (Chalk Hills)',
      permittedAreaSqM: 62000,
      permittedDepthM: 20,
      leaseExpiry: '2036-05-20',
      status: 'Active (Nominal)'
    },
    {
      leaseId: 'TN-HSR-GRN-2024-011',
      leaseHolderName: 'Hosur Industrial Granite Quarry',
      mineralType: 'Pink & Grey Granite',
      district: 'Krishnagiri / Hosur Belt',
      permittedAreaSqM: 51200,
      permittedDepthM: 18,
      leaseExpiry: '2035-11-10',
      status: 'Active (Nominal)'
    },
    {
      leaseId: 'TN-MDU-GRN-2024-004',
      leaseHolderName: 'Madurai Black Granite Exporters Ltd',
      mineralType: 'Dimension Granite Stone',
      district: 'Madurai District (Melur Sector)',
      permittedAreaSqM: 74100,
      permittedDepthM: 25,
      leaseExpiry: '2038-04-12',
      status: 'Active (Nominal)'
    }
  ];

  const displayList = leases.length > 0 ? leases : defaultLeases;

  return (
    <div className="fixed inset-0 z-[5000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#131B2B] border-2 border-[#0EA5E9]/50 rounded-xl max-w-4xl w-full p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0EA5E9]/15 border border-[#0EA5E9]/40 rounded-lg text-[#0EA5E9]">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Active Mining Leases & Permitted AOI Directory</h2>
                <span className="bg-[#0EA5E9]/20 text-[#0EA5E9] text-[10px] font-mono px-2 py-0.5 rounded border border-[#0EA5E9]/40 font-bold uppercase">
                  2DSPHERE SPATIAL INDEX ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">Department of Geology & Mining Official Concession Leases Registry</p>
            </div>
          </div>

          <button onClick={onClose} className="text-white bg-[#0EA5E9] hover:bg-[#0284C7] text-xs font-bold px-4 py-2 rounded shadow transition-all">
            ✕ Close Directory
          </button>
        </div>

        {/* Leases Table */}
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#0B0F17] text-[#0EA5E9] uppercase">
                <th className="p-3">Lease ID</th>
                <th className="p-3">Leaseholder Entity</th>
                <th className="p-3">Mineral Type</th>
                <th className="p-3">District / Sector</th>
                <th className="p-3">Permitted Area & Depth</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {displayList.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#0B0F17]/60 transition-colors">
                  <td className="p-3 font-bold text-[#0EA5E9]">{item.leaseId || `TN-KRR-GRN-2024-00${idx + 1}`}</td>
                  <td className="p-3 font-medium text-white">{item.leaseHolderName || 'Concession Leaseholder'}</td>
                  <td className="p-3 text-[#F59E0B] font-bold">{item.mineralType || 'Granite'}</td>
                  <td className="p-3 text-[#94A3B8]">{item.district || 'Tamil Nadu Sector'}</td>
                  <td className="p-3 text-white font-bold">{item.permittedAreaSqM?.toLocaleString() || 45200} sq.m (-{item.permittedDepthM || 15}m floor)</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                      item.status?.includes('Breach')
                        ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30'
                        : 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30'
                    }`}>
                      {item.status || 'Active (Nominal)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="bg-[#0B0F17] border border-[#1E293B] p-3 rounded-lg flex items-center justify-between text-xs text-[#94A3B8]">
          <span>Monitored by Sentinel-2B Optical + Sentinel-1 SAR Cloud Penetrating Radar</span>
          <span className="font-mono text-[#0EA5E9] font-bold">Total Active Leases: {displayList.length}</span>
        </div>
      </div>
    </div>
  );
}
