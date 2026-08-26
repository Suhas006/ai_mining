import React, { useState } from 'react';
import { Cpu, AlertTriangle, Sparkles, CheckCircle2, Image } from 'lucide-react';

export default function AISurveillanceAnalyzer({ isOpen, onClose, leases = [], onAnalysisComplete }) {
  const [selectedLeaseId, setSelectedLeaseId] = useState(leases[0]?._id || '');
  const [mockType, setMockType] = useState('Boundary_Breach');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/surveillance/analyze-raster`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaseId: selectedLeaseId || leases[0]?._id,
          mockAnomalyType: mockType
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Satellite change analysis failed.');

      setResult(data);
      onAnalysisComplete(data.anomaly);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131B2B] border border-[#1E293B] rounded-lg max-w-xl w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#0EA5E9]" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Gemini 1.5 Flash Vision AI Interceptor</h2>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white text-sm">✕</button>
        </div>

        {error && (
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 p-3 rounded text-xs text-[#EF4444]">
            {error}
          </div>
        )}

        {result ? (
          <div className="bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-[#0EA5E9] font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Multimodal Satellite Analysis Complete!</span>
            </div>
            <div className="bg-[#0B0F17] p-3 rounded space-y-2 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-[#94A3B8]">Anomaly Type:</span>
                <span className="text-[#EF4444] font-bold">{result.anomaly.anomalyType}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-[#94A3B8]">Turf.js Infringing Area:</span>
                <span className="text-white font-bold">{result.breachAreaSqMeters} sq. meters</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-[#94A3B8]">AI Confidence Score:</span>
                <span className="text-[#10B981] font-bold">{(result.anomaly.aiConfidenceScore * 100).toFixed(0)}%</span>
              </div>
              <div className="text-[11px] text-[#94A3B8] pt-2 border-t border-[#1E293B]">
                <strong className="text-white block mb-0.5">Gemini Vision Log:</strong>
                {result.anomaly.aiAnalysisLog}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold py-2 rounded"
            >
              Close & View Anomaly on Map
            </button>
          </div>
        ) : (
          <form onSubmit={handleRunAnalysis} className="space-y-4 text-xs">
            <div>
              <label className="text-[#94A3B8] font-bold block mb-1">Target Mining Lease Area of Interest (AOI)</label>
              <select
                value={selectedLeaseId}
                onChange={(e) => setSelectedLeaseId(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#1E293B] rounded p-2 text-white focus:border-[#0EA5E9]"
              >
                {leases.map(l => (
                  <option key={l._id} value={l._id}>
                    {l.leaseId} — {l.leaseHolderName} ({l.mineralType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[#94A3B8] font-bold block mb-1">Change Event Classification</label>
              <select
                value={mockType}
                onChange={(e) => setMockType(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#1E293B] rounded p-2 text-white focus:border-[#0EA5E9]"
              >
                <option value="Boundary_Breach">Boundary Breach (Excavation Past Legal Buffer)</option>
                <option value="Excess_Excavation">Excess Excavation (Deep Pit Extraction Over Permitted Cap)</option>
                <option value="Unpermitted_Pit">Unpermitted Pit (New Unregulated Quarrying Benches)</option>
              </select>
            </div>

            <div className="bg-[#0B0F17] border border-[#1E293B] p-3 rounded-md space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-[#0EA5E9] font-bold uppercase">
                <Sparkles className="w-4 h-4" />
                Pipeline Execution Steps:
              </div>
              <ol className="list-decimal list-inside text-[11px] text-[#94A3B8] space-y-1 font-mono">
                <li>Ingest T0 (baseline) & T1 (recent) satellite rasters</li>
                <li>Execute Gemini 1.5 Vision strict JSON prompt call</li>
                <li>Extract changed pixel region & vectorize into GeoJSON</li>
                <li>Compute Turf.js <code className="text-[#0EA5E9]">difference(change, buffer(lease, 10m))</code></li>
                <li>Store illegal breach anomaly & emit live event alert</li>
              </ol>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-[#0B0F17] text-[#94A3B8] border border-[#1E293B] px-4 py-2 rounded font-medium hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold px-4 py-2 rounded flex items-center gap-1.5 shadow-md shadow-[#0EA5E9]/20"
              >
                {loading ? 'Ingesting Satellite Rasters...' : 'Trigger Gemini Change Interceptor'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
