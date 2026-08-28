import React, { useState } from 'react';
import { Cuboid, AlertTriangle, Download, ArrowDownToLine, MapPin, Activity } from 'lucide-react';

const DepthMapping = () => {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Function to fetch REAL Z-axis elevation data via your own Node.js backend
  const fetchRealElevation = async (latitude, longitude) => {
    try {
      // Dynamic URL for local development or Vercel/Render production
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      const response = await fetch(`${backendUrl}/api/elevation?lat=${latitude}&lng=${longitude}`);

      if (!response.ok) {
        throw new Error(`Backend returned status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.results && data.results.length > 0) {
        return data.results[0].elevation;
      } else {
        console.error("No elevation data found in response");
        return null;
      }

    } catch (error) {
      console.error("Error fetching real terrain data:", error);
      alert("Backend connection failed. Make sure your server URL is correct.");
      return null;
    }
  };

  // The live API execution function
  const handleFetch = async () => {
    if (!lat || !lng) return;
    setLoading(true);

    try {
      // Fetch exact Z-axis data for the USER PROVIDED coordinates
      const realElevation = await fetchRealElevation(lat, lng);

      if (realElevation !== null) {
        setResults({
          rawApiElevation: realElevation.toFixed(2), // Real NASA Z-Axis Elevation
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-full p-4 gap-4 bg-[#0B0F17]">
      {/* 80% 3D Terrain Placeholder */}
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
            <p className="text-[#475569] font-medium tracking-widest uppercase text-sm">Awaiting GPS Coordinates</p>
          </div>
        )}

        {loading && (
          <div className="z-10 text-center">
            <div className="w-16 h-16 border-4 border-[#0EA5E9]/20 border-t-[#0EA5E9] rounded-full animate-spin mx-auto mb-4 shadow-[0_0_20px_rgba(14,165,233,0.5)]" />
            <p className="text-[#0EA5E9] font-mono text-xs">FETCHING NASA TOPOGRAPHY DATA...</p>
          </div>
        )}

        {results && !loading && (
          <div className="z-10 w-full h-full flex flex-col items-center justify-center relative">
            <div className="relative w-64 h-64 perspective-1000">
              <div className="absolute inset-0 border-2 border-[#10B981] rounded-lg transform rotateX-45 shadow-[0_0_30px_rgba(16,185,129,0.2)]"></div>
              <div className="absolute top-1/2 left-1/4 right-1/4 bottom-0 border-2 border-[#38BDF8] bg-[#38BDF8]/10 transform rotateX-45 translateZ-12 shadow-[inset_0_0_20px_rgba(56,189,248,0.3)]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <ArrowDownToLine className="w-6 h-6 text-[#38BDF8] animate-bounce" />
                  <span className="bg-[#0B0F17] px-2 py-1 rounded text-[#38BDF8] text-[10px] font-mono border border-[#38BDF8]/30 mt-2">
                    Z-AXIS: {results.rawApiElevation}m
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 bg-[#131B2B]/90 backdrop-blur border border-[#1E293B] p-4 rounded-lg shadow-2xl">
              <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#0EA5E9]" />
                Live API Telemetry (Target Coordinates)
              </div>
              <div className="font-mono text-white text-sm">LAT: {lat}</div>
              <div className="font-mono text-white text-sm">LNG: {lng}</div>
            </div>
          </div>
        )}
      </div>

      {/* 20% Control Panel */}
      <div className="flex-[1] h-full bg-[#131B2B] rounded-xl border border-[#1E293B] shadow-2xl p-5 flex flex-col overflow-y-auto">
        <h2 className="text-white font-bold text-lg mb-1">3D Depth Mapping</h2>
        <p className="text-xs text-[#94A3B8] mb-6">Real-time Z-Axis Vertical Extraction (Zero Dummy Data).</p>

        {/* Real Coordinates Input */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
            Latitude (Y-Axis)
          </label>
          <input
            type="number"
            placeholder="e.g. 11.0168"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#1E293B] text-white text-sm rounded-lg px-4 py-3 mb-3 focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-all font-mono"
          />
          <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
            Longitude (X-Axis)
          </label>
          <input
            type="number"
            placeholder="e.g. 76.9558"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#1E293B] text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-all font-mono"
          />
        </div>

        {/* Fetch Button */}
        <button
          onClick={handleFetch}
          disabled={!lat || !lng || loading}
          className="w-full bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:from-[#38BDF8] hover:to-[#0EA5E9] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all mb-6"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Activity className="w-4 h-4" />
          )}
          {loading ? 'Querying Satellite...' : 'Fetch Live Z-Axis'}
        </button>

        {/* Real Data Results Section */}
        {results && (
          <div className="mt-2 mb-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 text-[#38BDF8] font-bold text-sm mb-1">
                <Activity className="w-4 h-4" />
                Verified Satellite Telemetry
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-white/10">
                  <span className="text-[#94A3B8]">Data Source:</span>
                  <span className="text-white font-mono bg-white/10 px-2 py-1 rounded">
                    NASA SRTM (LiDAR/Radar)
                  </span>
                </div>

                <div className="flex flex-col gap-1 pt-2">
                  <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Absolute Terrain Elevation (Z-Axis)</span>
                  <span className="text-[#38BDF8] font-bold font-mono text-2xl drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
                    {results.rawApiElevation} Meters
                  </span>
                  <span className="text-[10px] text-[#475569] mt-1">
                    *Elevation is measured precisely above global sea level based on live API ping.
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