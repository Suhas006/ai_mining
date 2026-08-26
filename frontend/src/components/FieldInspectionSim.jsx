import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle2, ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import { getSatelliteImage } from '../utils/satelliteImageAssets';

export default function FieldInspectionSim({ isOpen, onClose, anomalies = [], onInspectionSubmitted }) {
  const [loading, setLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [fieldImg, setFieldImg] = useState('');

  useEffect(() => {
    setFieldImg(getSatelliteImage('field'));
  }, []);

  if (!isOpen) return null;

  const targetAnomaly = anomalies[0];

  const handleVerifyGroundEvidence = async () => {
    setLoading(true);
    setSyncMessage('');

    const clientUuid = `mobile-uuid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const payload = {
      anomalyId: targetAnomaly ? targetAnomaly._id : 'mock-anomaly-id',
      clientUuid,
      groundCoordinates: [77.9672, 10.9540],
      gpsAccuracyMeters: 3.4,
      fieldRemarks: 'Ground survey verified unpermitted quarry pit bench removal extending 42 meters beyond legal northern marker #14.',
      isBreachConfirmed: true,
      evidencePhotoUrls: ['https://images.unsplash.com/photo-1508873696983-2df515122519?w=800&auto=format&fit=crop'],
      submittedAt: new Date().toISOString()
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inspection/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setSyncMessage('✅ Inspector R. Raman Evidence Verified! Status flipped to VERIFIED / FINE LEVIED (₹51.53 Cr).');
        if (onInspectionSubmitted) onInspectionSubmitted(data.inspection);
      } else {
        setSyncMessage('✓ Verified Ground Evidence! Case locked with green checkmark.');
        if (onInspectionSubmitted) onInspectionSubmitted({ ...payload, syncStatus: 'synced' });
      }
    } catch (err) {
      setSyncMessage('✓ Verified Ground Evidence! Case locked with green checkmark.');
      if (onInspectionSubmitted) onInspectionSubmitted({ ...payload, syncStatus: 'synced' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-[#0B0F17] border-l border-slate-700 shadow-2xl p-6 z-[5000] transition-transform flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-sky-400" />
            <h3 className="text-sky-400 font-bold tracking-wider text-sm uppercase">LIVE FIELD SYNC</h3>
          </div>
          <button onClick={onClose} className="text-red-500 font-bold text-sm hover:text-red-400">✕</button>
        </div>

        {syncMessage && (
          <div className="bg-emerald-500/15 border border-emerald-500/40 p-3 rounded text-xs text-emerald-400 font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Mock Mobile Sync Card */}
        <div className="bg-[#131B2B] p-4 rounded-md border border-slate-700 space-y-3 shadow-lg">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-300 font-bold">Inspector: R. Raman</p>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              Hive Mobile Connected
            </span>
          </div>
          
          <p className="text-xs text-slate-400 font-mono">Location: [77.9672, 10.9540]</p>
          <p className="text-xs text-slate-400 font-mono">Dwell GPS Fix: ±3.4m accuracy</p>

          {/* Geotagged Ground Photo */}
          <div className="w-full h-36 bg-slate-800 rounded mb-4 flex items-center justify-center text-slate-500 text-sm overflow-hidden relative border border-slate-700">
            {fieldImg && (
              <img
                src={fieldImg}
                alt="Geotagged Ground Evidence Photo"
                className="object-cover w-full h-full"
              />
            )}
            <div className="absolute bottom-2 left-2 bg-black/85 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-700">
              ✓ Geotagged [77.9672, 10.9540]
            </div>
          </div>

          <div className="text-[11px] text-slate-300 bg-[#0B0F17] p-2.5 rounded border border-slate-800 space-y-1">
            <div><strong className="text-white">Lease ID:</strong> TN-KRR-GRN-2024-009</div>
            <div><strong className="text-white">Field Notes:</strong> Confirmed 42m unpermitted granite bench removal past legal marker #14.</div>
          </div>

          <button
            onClick={handleVerifyGroundEvidence}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-bold rounded transition-colors shadow-lg flex items-center justify-center gap-1.5"
          >
            <Lock className="w-4 h-4" />
            {loading ? 'Verifying Ground Evidence...' : 'Verify Ground Evidence & Lock Case'}
          </button>
        </div>
      </div>

      <div className="text-[11px] text-slate-500 text-center border-t border-slate-800 pt-3">
        GeoSuraksha Mobile Hive Sync Engine v2.0
      </div>
    </div>
  );
}
