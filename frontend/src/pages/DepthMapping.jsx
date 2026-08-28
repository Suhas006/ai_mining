import React, { useState } from 'react';
import { Cuboid, AlertTriangle, ArrowDownToLine, ArrowUpToLine, MapPin, Activity } from 'lucide-react';

const DepthMapping = () => {
  // Reference Point (Normal Ground)
  const [baseLat, setBaseLat] = useState('');
  const [baseLng, setBaseLng] = useState('');

  // Target Point (Inside the Pit or Top of Building)
  const [targetLat, setTargetLat] = useState('');
  const [targetLng, setTargetLng] = useState('');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Fetch from your Render Backend
  const fetchRealElevation = async (latitude, longitude) => {
    try {
      // Clean backend URL
      const backendUrl = 'https://ai-mining.onrender.com';

      const response = await fetch(`${backendUrl}/api/elevation?lat=${latitude}&lng=${longitude}`);

      if (!response.ok) throw new Error(`Backend returned status: ${response.status}`);
      const data = await response.json();

      if (data && data.results && data.results.length > 0) {
        return data.results[0].elevation;
      }
      return null;
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  };

  const handleFetch = async () => {
    if (!baseLat || !baseLng || !targetLat || !targetLng) {
      alert("Please enter both Reference and Target coordinates.");
      return;
    }
    setLoading(true);

    try {
      // 1. Fetch Ground Level
      const baseElevation = await fetchRealElevation(baseLat, baseLng);
      // 2. Fetch Pit/Building Level
      const targetElevation = await fetchRealElevation(targetLat, targetLng);

      if (baseElevation !== null && targetElevation !== null) {
        // Calculate the exact Z-Axis difference
        const zDifference = baseElevation - targetElevation;

        // If difference is positive, it's a hole/dig. If negative, it's a building.
        const isDig = zDifference >= 0;
        const exactZAxis = Math.abs(zDifference).toFixed(2);

        setResults({
          baseElev: baseElevation.toFixed(2),
          targetElev: targetElevation.toFixed(2),
          exactZAxis: exactZAxis,
          type: isDig ? 'Excavation (Depth)' : 'Structure (Height)'
        });
      } else {
        alert("Failed to fetch satellite data. Check your backend connection.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-full p-4 gap-4 bg-[#0B0F17]">
      {/* 80% Main Canvas */}
      <div className="flex-[4] h-full rounded-xl overflow-hidden shadow-2xl border border-[#1E293B] relative bg-[#0F172A] flex flex-col items-center justify-center">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#38BDF8 1px, transparent 1px), linear-gradient(90deg, #38BDF8 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            transform: 'perspective(1000px) rotateX(60deg) translateY(-100px) translateZ(-200px) scale(3)',
            transformOrigin: 'top center'
          }}
        />

        {!results && !loading && (
          <div className="z-10 text-center animate-pulse">
            <Cuboid className="w-20 h-20 text-[#1E293B] mx-auto mb-4" />
            <p className="text-[#475569] font-medium tracking-widest uppercase text-sm">Awaiting Baseline & Target GPS Coordinates</p>
          </div>
        )}

        {loading && (
          <div className="z-10 text-center">
            <div className="w-16 h-16 border-4 border-[#0EA5E9]/20 border-t-[#0EA5E9] rounded-full animate-spin mx-auto mb-4 shadow-[0_0_20px_rgba(14,165,233,0.5)]" />
            <p className="text-[#0EA5E9] font-mono text-xs">CALCULATING DELTA FROM ESA COPERNICUS...</p>
          </div>
        )}

        {results && !loading && (
          <div className="z-10 w-full h-full flex flex-col items-center justify-center relative">
            <div className="relative w-64 h-64 perspective-1000">
              <div className="absolute inset-0 border-2 border-[#10B981] rounded-lg transform rotateX-45 shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-center">
                <span className="absolute -right-24 text-[#10B981] text-xs font-mono bg-[#10B981]/10 px-2 py-1 rounded">Ground: {results.baseElev}m</span>
              </div>

              <div className={`absolute top-1/2 left-1/4 right-1/4 bottom-0 border-2 ${results.type.includes('Depth') ? 'border-[#38BDF8] bg-[#38BDF8]/10 translateZ-12 shadow-[inset_0_0_20px_rgba(56,189,248,0.3)]' : 'border-[#F59E0B] bg-[#F59E0B]/10 -translateZ-12 shadow-[0_0_20px_rgba(245,158,11,0.3)]'} transform rotateX-45 flex items-center justify-center`}>
                <div className="absolute flex flex-col items-center -mt-6">
                  {results.type.includes('Depth') ? (
                    <ArrowDownToLine className="w-6 h-6 text-[#38BDF8] animate-bounce" />
                  ) : (
                    <ArrowUpToLine className="w-6 h-6 text-[#F59E0B] animate-bounce" />
                  )}
                  <span className={`bg-[#0B0F17] px-2 py-1 rounded text-[10px] font-mono border mt-2 ${results.type.includes('Depth') ? 'text-[#38BDF8] border-[#38BDF8]/30' : 'text-[#F59E0B] border-[#F59E0B]/30'}`}>
                    EXACT {results.type.includes('Depth') ? 'DEPTH' : 'HEIGHT'}: {results.exactZAxis}m
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 bg-[#131B2B]/90 backdrop-blur border border-[#1E293B] p-4 rounded-lg shadow-2xl">
              <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#0EA5E9]" />
                Target Telemetry
              </div>
              <div className="font-mono text-white text-sm">LAT: {targetLat}</div>
              <div className="font-mono text-white text-sm">LNG: {targetLng}</div>
            </div>
          </div>
        )}
      </div>

      {/* 20% Control Panel */}
      <div className="flex-[1] h-full bg-[#131B2B] rounded-xl border border-[#1E293B] shadow-2xl p-5 flex flex-col overflow-y-auto">
        <h2 className="text-white font-bold text-lg mb-1">Delta Z-Axis Scanner</h2>
        <p className="text-xs text-[#94A3B8] mb-6">Calculates exact physical depth or height using differential satellite telemetry.</p>

        {/* BASELINE Input */}
        <div className="mb-4 pb-4 border-b border-white/5">
          <label className="block text-xs font-bold text-[#10B981] uppercase tracking-wider mb-2">
            1. Reference Ground (Baseline)
          </label>
          <input
            type="number"
            placeholder="Ground Lat (e.g. 11.0168)"
            value={baseLat}
            onChange={(e) => setBaseLat(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#1E293B] text-white text-sm rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-[#10B981] font-mono"
          />
          <input
            type="number"
            placeholder="Ground Lng (e.g. 76.9558)"
            value={baseLng}
            onChange={(e) => setBaseLng(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#1E293B] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#10B981] font-mono"
          />
        </div>

        {/* TARGET Input */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-[#38BDF8] uppercase tracking-wider mb-2">
            2. Target (Pit / Building)
          </label>
          <input
            type="number"
            placeholder="Target Lat (e.g. 11.0169)"
            value={targetLat}
            onChange={(e) => setTargetLat(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#1E293B] text-white text-sm rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-[#38BDF8] font-mono"
          />
          <input
            type="number"
            placeholder="Target Lng (e.g. 76.9559)"
            value={targetLng}
            onChange={(e) => setTargetLng(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#1E293B] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#38BDF8] font-mono"
          />
        </div>

        <button
          onClick={handleFetch}
          disabled={!baseLat || !baseLng || !targetLat || !targetLng || loading}
          className="w-full bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:from-[#38BDF8] hover:to-[#0EA5E9] disabled:opacity-50 text-white text-sm font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-6"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Activity className="w-4 h-4" />}
          {loading ? 'Calculating...' : 'Calculate Exact Z-Axis'}
        </button>

        {/* Results Section */}
        {results && (
          <div className="mt-2 mb-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
                Verified {results.type}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs pb-1 border-b border-white/10">
                  <span className="text-[#94A3B8]">Reference Ground Elev:</span>
                  <span className="text-[#10B981] font-mono">{results.baseElev}m</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-1 border-b border-white/10">
                  <span className="text-[#94A3B8]">Target Point Elev:</span>
                  <span className="text-white font-mono">{results.targetElev}m</span>
                </div>

                <div className="flex flex-col gap-1 pt-2">
                  <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Calculated Exact Z-Axis</span>
                  <span className={`font-bold font-mono text-2xl ${results.type.includes('Depth') ? 'text-[#38BDF8]' : 'text-[#F59E0B]'}`}>
                    {results.exactZAxis} Meters
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-white/10 mt-2">
                  <span className="text-[#94A3B8]">Data Source:</span>
                  <span className="text-white font-mono bg-white/10 px-2 py-1 rounded">
                    ESA Copernicus (LiDAR/Radar)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepthMapping;