import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, FileText, UserCheck, Image, ShieldAlert, ArrowRight, Download } from 'lucide-react';
import { getSatelliteImage } from '../utils/satelliteImageAssets';
import CsvExportButton from './CsvExportButton';
import { generateLegalNotice } from '../utils/pdfGenerator';

export default function AnomalyTriage({ anomalies = [], officers = [], onUpdateStatus, onAssignOfficer, onGeneratePDF }) {
  const [selectedAnomaly, setSelectedAnomaly] = useState(anomalies[0] || null);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [t0Img, setT0Img] = useState('');
  const [t1Img, setT1Img] = useState('');

  useEffect(() => {
    setT0Img(getSatelliteImage('t30'));
    setT1Img(getSatelliteImage('t0'));
  }, []);

  const filteredAnomalies = anomalies.filter(a => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="bg-[#131B2B] border border-[#1E293B] rounded-lg p-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wide">Surveillance Anomaly Triage Queue</h2>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">Enforcement Officer Incident Review & Case Lifecycle Dispatch</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div>
            <label className="text-[10px] text-[#94A3B8] uppercase block mb-1">Severity</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-[#0B0F17] border border-[#1E293B] text-xs text-white rounded px-2.5 py-1.5 focus:border-[#0EA5E9]"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#94A3B8] uppercase block mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#0B0F17] border border-[#1E293B] text-xs text-white rounded px-2.5 py-1.5 focus:border-[#0EA5E9]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending_Inspection">Pending Inspection</option>
              <option value="Verified">Verified</option>
              <option value="Legal_Notice_Issued">Legal Notice Issued</option>
              <option value="Dismissed">Dismissed</option>
            </select>
          </div>
          
          <CsvExportButton data={filteredAnomalies} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Anomaly Case List */}
        <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {filteredAnomalies.length === 0 ? (
            <div className="p-8 text-center bg-[#0B0F17] rounded-md border border-[#1E293B] text-[#94A3B8]">
              <AlertTriangle className="w-8 h-8 text-[#94A3B8] mx-auto mb-2 opacity-40" />
              <p className="text-xs">No surveillance anomalies match the selected filters.</p>
            </div>
          ) : (
            filteredAnomalies.map((item) => {
              const isSelected = selectedAnomaly && selectedAnomaly._id === item._id;

              return (
                <div
                  key={item._id}
                  onClick={() => setSelectedAnomaly(item)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#0B0F17] border-[#EF4444] shadow-lg shadow-[#EF4444]/10'
                      : 'bg-[#0B0F17]/60 border-[#1E293B] hover:border-[#334155]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                      item.severity === 'Critical' ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30' :
                      item.severity === 'High' ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30' :
                      'bg-[#0EA5E9]/20 text-[#0EA5E9]'
                    }`}>
                      {item.severity} • {item.anomalyType}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] font-mono">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-white mb-1">
                    {item.leaseId?.leaseHolderName || 'Karur Mining Sector'}
                  </div>

                  <p className="text-[11px] text-[#94A3B8] line-clamp-2 mb-2">
                    {item.aiAnalysisLog}
                  </p>

                  <div className="flex items-center justify-between text-[11px] border-t border-[#1E293B] pt-2">
                    <span className="font-mono text-white">
                      Area: <strong className="text-[#EF4444]">{item.breachAreaSqMeters} sq.m</strong>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#131B2B] text-[#0EA5E9] border border-[#1E293B]">
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Case Deep Dive & Action Hub */}
        <div className="lg:col-span-7 bg-[#0B0F17] border border-[#1E293B] rounded-lg p-5 flex flex-col justify-between">
          {selectedAnomaly ? (
            <div className="space-y-5">
              {/* Selected Anomaly Details Header */}
              <div className="flex items-start justify-between border-b border-[#1E293B] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white font-mono uppercase">{selectedAnomaly.anomalyType}</h3>
                    <span className="bg-[#EF4444]/20 text-[#EF4444] text-[10px] font-mono px-2 py-0.5 rounded">
                      ID: {selectedAnomaly._id.slice(-8)}
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-0.5">Lease: {selectedAnomaly.leaseId?.leaseId || 'TN-KRR-GRN-2024-009'}</p>
                </div>
                <button
                  onClick={() => generateLegalNotice(selectedAnomaly)}
                  className="flex items-center gap-1.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold px-3 py-1.5 rounded transition-all shadow-md"
                >
                  <Download className="w-4 h-4" />
                  Generate Legal PDF Notice
                </button>
              </div>

              {/* Side-by-Side Satellite Raster Imagery Comparison */}
              <div>
                <div className="flex items-center justify-between text-xs text-[#94A3B8] font-bold uppercase mb-2">
                  <span className="flex items-center gap-1">
                    <Image className="w-3.5 h-3.5 text-[#0EA5E9]" />
                    Satellite Change Interceptor (T0 vs T1)
                  </span>
                  <span className="font-mono text-[#10B981]">Gemini 1.5 Vision Confidence: {(selectedAnomaly.aiConfidenceScore * 100).toFixed(0)}%</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative rounded overflow-hidden border border-[#1E293B] group bg-[#0B0F17]">
                    {t0Img && (
                      <img
                        src={t0Img}
                        alt="T0 Baseline Satellite Raster"
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="absolute top-2 left-2 bg-[#0B0F17]/90 text-white text-[10px] font-mono px-2 py-0.5 rounded border border-[#1E293B]">
                      T0 Baseline Raster (25 July)
                    </div>
                  </div>

                  <div className="relative rounded overflow-hidden border-2 border-[#EF4444] group bg-[#0B0F17]">
                    {t1Img && (
                      <img
                        src={t1Img}
                        alt="T1 Breach Detected Satellite Raster"
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="absolute top-2 left-2 bg-[#EF4444] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow">
                      T1 Breach Detected (25 Aug)
                    </div>
                  </div>
                </div>
              </div>

              {/* Field Inspection Ground Truth Badge */}
              <div className="bg-[#131B2B] border border-[#1E293B] p-3.5 rounded-md text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#10B981] font-bold uppercase tracking-wider block">Field Inspection & Ground Truth Sync</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    selectedAnomaly.status === 'Verified' || selectedAnomaly.status === 'Legal_Notice_Issued'
                      ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30'
                      : 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30'
                  }`}>
                    {selectedAnomaly.status === 'Verified' || selectedAnomaly.status === 'Legal_Notice_Issued'
                      ? '✓ Verified Ground Truth'
                      : '⏳ Pending Officer Field Inspection'}
                  </span>
                </div>

                <p className="text-white text-[11px] leading-relaxed">
                  {selectedAnomaly.status === 'Verified' || selectedAnomaly.status === 'Legal_Notice_Issued'
                    ? '✓ Ground survey officer confirmed unpermitted quarry bench extraction using Dwell-Averaged GPS Waypoints (±3.4m accuracy fix). Photo evidence geotagged.'
                    : selectedAnomaly.aiAnalysisLog}
                </p>

                <div className="text-[11px] text-[#94A3B8] font-mono pt-1.5 border-t border-[#1E293B] flex items-center justify-between">
                  <span>Centroid: [{selectedAnomaly.detectedCoordinates?.coordinates.join(', ')}]</span>
                  <span className="text-[#EF4444] font-bold">Area: {selectedAnomaly.breachAreaSqMeters} sq.m</span>
                </div>
              </div>

              {/* Officer Assignment & Case Workflow Actions */}
              <div className="border-t border-[#1E293B] pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8] font-bold uppercase">Assign Enforcement Officer:</span>
                  <select
                    value={selectedAnomaly.assignedOfficerId?._id || ''}
                    onChange={(e) => onAssignOfficer(selectedAnomaly._id, e.target.value)}
                    className="bg-[#131B2B] border border-[#1E293B] text-xs text-white rounded px-2.5 py-1 focus:border-[#0EA5E9]"
                  >
                    <option value="">-- Select Officer --</option>
                    {officers.map(off => (
                      <option key={off._id} value={off._id}>{off.name} ({off.role})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    onClick={() => onUpdateStatus(selectedAnomaly._id, 'Verified')}
                    className="bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] border border-[#10B981]/40 text-xs font-bold py-2 rounded flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Verify Breach
                  </button>

                  <button
                    onClick={() => onUpdateStatus(selectedAnomaly._id, 'Legal_Notice_Issued')}
                    className="bg-[#0EA5E9]/20 hover:bg-[#0EA5E9]/30 text-[#0EA5E9] border border-[#0EA5E9]/40 text-xs font-bold py-2 rounded flex items-center justify-center gap-1.5 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    Issue Notice
                  </button>

                  <button
                    onClick={() => onUpdateStatus(selectedAnomaly._id, 'Dismissed')}
                    className="bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] border border-[#334155] text-xs font-bold py-2 rounded flex items-center justify-center gap-1.5 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    Dismiss Case
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#94A3B8]">
              <AlertTriangle className="w-10 h-10 text-[#EF4444]/40 mb-3" />
              <p className="text-xs">Select an anomaly incident from the queue on the left to inspect satellite evidence.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
