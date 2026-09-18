import React, { useState } from 'react';
import axios from 'axios';
import { Map, Activity, CheckCircle, Navigation } from 'lucide-react';

const ZAxisAnalyzer = () => {
  const [coordinates, setCoordinates] = useState('[\n  [12.9716, 77.5946],\n  [12.9716, 77.5950],\n  [12.9720, 77.5950],\n  [12.9720, 77.5946]\n]');
  const [depthMetrics, setDepthMetrics] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);

  const handleCalculate = async () => {
    setIsCalculating(true);
    setDepthMetrics(null);
    setError(null);
    
    try {
      let polygon;
      try {
        polygon = JSON.parse(coordinates);
      } catch (e) {
        throw new Error('Invalid JSON format for coordinates. Please use a valid array of [lat, lng] arrays.');
      }
      
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://ai-mining.onrender.com';
      const token = localStorage.getItem('depthfence_token');
      
      const response = await axios.post(`${backendUrl}/api/geo/calculate-z-axis`, { polygon }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDepthMetrics(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to interface with DEM Satellites.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 font-sans bg-[#0B0F17] text-white h-full">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <h1 className="text-3xl font-bold flex items-center gap-3 text-white mb-2">
          <Map className="w-8 h-8 text-cyan-500" />
          3D Z-Axis Analyzer
        </h1>
        <p className="text-slate-400 mb-8">Independent volumetric depth and elevation scanning using Copernicus DEM infrastructure.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-cyan-400" /> Boundary Coordinates (Polygon)
          </h2>
          <p className="text-sm text-slate-400 mb-4">Input a JSON array of [latitude, longitude] pairs representing the scanned area.</p>
          
          <textarea
            value={coordinates}
            onChange={(e) => setCoordinates(e.target.value)}
            className="w-full h-40 bg-[#131B2B] border border-[#1E293B] rounded-lg p-4 font-mono text-sm text-cyan-400 focus:outline-none focus:border-cyan-500 mb-6 shadow-inner"
            placeholder="[[lat, lng], ...]"
          />

          <button
            onClick={handleCalculate}
            disabled={isCalculating || !coordinates}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 disabled:opacity-50 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/50"
          >
            {isCalculating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Interfacing with DEM Satellites...</span>
              </>
            ) : (
              <>
                <Activity className="w-5 h-5" />
                <span>Calculate Z-Axis Depth (Copernicus DEM)</span>
              </>
            )}
          </button>

          {depthMetrics && (
            <div className="mt-8 p-6 rounded-2xl bg-[#0B0F17]/80 backdrop-blur-md border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)] relative overflow-hidden group">
              <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[150%] bg-cyan-500/10 blur-[60px] pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700"></div>
              <h4 className="text-cyan-400 font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5" /> Volumetric Data Card
              </h4>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center bg-[#131B2B] p-3 rounded-lg border border-[#1E293B]">
                  <span className="text-slate-400 font-medium">Average Elevation</span>
                  <span className="text-white font-mono font-bold text-lg">{depthMetrics.averageElevation}m</span>
                </div>
                <div className="flex justify-between items-center bg-[#131B2B] p-3 rounded-lg border border-[#1E293B]">
                  <span className="text-slate-400 font-medium">Max Peak</span>
                  <span className="text-emerald-400 font-mono font-bold text-lg">{depthMetrics.maxElevation}m</span>
                </div>
                <div className="flex justify-between items-center bg-[#131B2B] p-3 rounded-lg border border-[#1E293B]">
                  <span className="text-slate-400 font-medium">Maximum Depth Floor</span>
                  <span className="text-cyan-400 font-mono font-bold text-lg">{depthMetrics.minElevation}m</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-cyan-500/20 text-xs text-slate-500 font-mono flex justify-between items-center">
                <span>SRC: {depthMetrics.dataSource}</span>
                <span className="text-cyan-500 flex items-center gap-1 font-bold"><CheckCircle className="w-4 h-4"/> CONNECTION SECURE</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZAxisAnalyzer;
