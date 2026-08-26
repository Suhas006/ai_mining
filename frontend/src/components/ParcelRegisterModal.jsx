import React, { useState } from 'react';
import { Layers, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function ParcelRegisterModal({ isOpen, onClose, onRegisterSuccess }) {
  const [ownerName, setOwnerName] = useState('N. Palanisamy & Co');
  const [surveyNumber, setSurveyNumber] = useState('SF-204/1A Karur East');
  const [areaAcres, setAreaAcres] = useState(18.5);
  const [districtCode, setDistrictCode] = useState('33');
  const [polygonJson, setPolygonJson] = useState(
    JSON.stringify({
      type: "Polygon",
      coordinates: [[
        [77.9620, 10.9600],
        [77.9670, 10.9600],
        [77.9670, 10.9650],
        [77.9620, 10.9650],
        [77.9620, 10.9600]
      ]]
    }, null, 2)
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredResult, setRegisteredResult] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRegisteredResult(null);

    try {
      let boundaryPolygon;
      try {
        boundaryPolygon = JSON.parse(polygonJson);
      } catch (parseErr) {
        throw new Error('Invalid GeoJSON syntax. Please check coordinates format.');
      }

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/parcels/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName,
          surveyNumber,
          areaAcres: Number(areaAcres),
          boundaryPolygon,
          districtCode
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register land parcel.');

      setRegisteredResult(data.parcel);
      onRegisterSuccess(data.parcel);
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
            <Layers className="w-5 h-5 text-[#10B981]" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Register Land Parcel & Generate ULPIN</h2>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white text-sm">✕</button>
        </div>

        {error && (
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 p-3 rounded text-xs text-[#EF4444] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {registeredResult ? (
          <div className="bg-[#10B981]/10 border border-[#10B981]/30 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-[#10B981] font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Parcel Registered & ULPIN Assigned!</span>
            </div>
            <div className="bg-[#0B0F17] p-3 rounded font-mono text-center">
              <span className="text-[11px] text-[#94A3B8] block uppercase">Derived 14-Digit ULPIN</span>
              <span className="text-xl font-bold text-[#10B981] tracking-widest block mt-1">{registeredResult.ulpin}</span>
            </div>
            <div className="text-xs text-[#94A3B8] space-y-1">
              <div><strong className="text-white">Owner:</strong> {registeredResult.ownerName}</div>
              <div><strong className="text-white">Survey No:</strong> {registeredResult.surveyNumber}</div>
              <div><strong className="text-white">Centroid:</strong> [{registeredResult.centroid?.coordinates.join(', ')}]</div>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold py-2 rounded mt-2"
            >
              Done & Refresh Map
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#94A3B8] font-bold block mb-1">Land Owner Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-[#1E293B] rounded p-2 text-white focus:border-[#10B981]"
                  required
                />
              </div>

              <div>
                <label className="text-[#94A3B8] font-bold block mb-1">Survey / Field Number</label>
                <input
                  type="text"
                  value={surveyNumber}
                  onChange={(e) => setSurveyNumber(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-[#1E293B] rounded p-2 text-white focus:border-[#10B981]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#94A3B8] font-bold block mb-1">Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={areaAcres}
                  onChange={(e) => setAreaAcres(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-[#1E293B] rounded p-2 text-white focus:border-[#10B981]"
                  required
                />
              </div>

              <div>
                <label className="text-[#94A3B8] font-bold block mb-1">District Code (State Prefix)</label>
                <input
                  type="text"
                  value={districtCode}
                  onChange={(e) => setDistrictCode(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-[#1E293B] rounded p-2 text-white focus:border-[#10B981]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[#94A3B8] font-bold block mb-1 flex items-center justify-between">
                <span>GeoJSON Polygon Coordinates [lng, lat]</span>
                <span className="text-[10px] text-[#10B981] font-mono">WGS84 Standard</span>
              </label>
              <textarea
                rows={5}
                value={polygonJson}
                onChange={(e) => setPolygonJson(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#1E293B] rounded p-2 text-white font-mono text-[11px] focus:border-[#10B981]"
                required
              />
            </div>

            <div className="bg-[#0B0F17] p-2.5 rounded border border-[#1E293B] text-[11px] text-[#94A3B8] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>Backend automatically computes geometry centroid and encodes a 14-digit ULPIN with mod-10 check digit.</span>
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
                className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-4 py-2 rounded flex items-center gap-1.5 shadow-md shadow-[#10B981]/20"
              >
                {loading ? 'Computing ULPIN...' : 'Register & Generate ULPIN'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
