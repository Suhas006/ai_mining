import React, { useState } from 'react';
import { Cuboid, AlertTriangle, Download, ArrowDownToLine, MapPin } from 'lucide-react';

const DepthMapping = () => {
  const [ulpin, setUlpin] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFetch = () => {
    if (!ulpin) return;
    setLoading(true);
    
    // Simulate API fetch
    setTimeout(() => {
      setResults({
        permitted: 15,
        actual: 42,
        illegalVolume: 12500
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex w-full h-full p-4 gap-4 bg-[#0B0F17]">
      {/* 80% 3D Terrain Placeholder */}
      <div className="flex-[4] h-full rounded-xl overflow-hidden shadow-2xl border border-[#1E293B] relative bg-[#0F172A] flex flex-col items-center justify-center">
        {/* Subtle isometric grid background */}
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
            <p className="text-[#475569] font-medium tracking-widest uppercase text-sm">Awaiting ULPIN Coordinates</p>
          </div>
        )}

        {loading && (
          <div className="z-10 text-center">
            <div className="w-16 h-16 border-4 border-[#0EA5E9]/20 border-t-[#0EA5E9] rounded-full animate-spin mx-auto mb-4 shadow-[0_0_20px_rgba(14,165,233,0.5)]" />
            <p className="text-[#0EA5E9] font-mono text-xs">RENDERING 3D POINT CLOUD...</p>
          </div>
        )}

        {results && !loading && (
          <div className="z-10 w-full h-full flex flex-col items-center justify-center relative">
             {/* Simulated Pit Visualization */}
             <div className="relative w-64 h-64 perspective-1000">
                <div className="absolute inset-0 border-2 border-[#10B981] rounded-lg transform rotateX-45 shadow-[0_0_30px_rgba(16,185,129,0.2)]"></div>
                <div className="absolute top-1/2 left-1/4 right-1/4 bottom-0 border-2 border-[#EF4444] bg-[#EF4444]/10 transform rotateX-45 translateZ-12 shadow-[inset_0_0_20px_rgba(239,68,68,0.3)]">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <ArrowDownToLine className="w-6 h-6 text-[#EF4444] animate-bounce" />
                      <span className="bg-[#0B0F17] px-2 py-1 rounded text-[#EF4444] text-[10px] font-mono border border-[#EF4444]/30 mt-2">
                        DEPTH: -{results.actual}m
                      </span>
                   </div>
                </div>
             </div>
             
             <div className="absolute bottom-8 left-8 bg-[#131B2B]/90 backdrop-blur border border-[#1E293B] p-4 rounded-lg shadow-2xl">
               <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#0EA5E9]"/>
                  LiDAR Telemetry Data
               </div>
               <div className="font-mono text-white text-sm">ULPIN: {ulpin}</div>
             </div>
          </div>
        )}
      </div>

      {/* 20% Control Panel */}
      <div className="flex-[1] h-full bg-[#131B2B] rounded-xl border border-[#1E293B] shadow-2xl p-5 flex flex-col overflow-y-auto">
        <h2 className="text-white font-bold text-lg mb-1">3D Depth Mapping</h2>
        <p className="text-xs text-[#94A3B8] mb-6">Vertical volumetric analysis for illegal pit mining.</p>

        {/* Input Field */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
            Target Land Parcel
          </label>
          <input 
            type="text" 
            placeholder="Enter 14-Digit ULPIN" 
            value={ulpin}
            onChange={(e) => setUlpin(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#1E293B] text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all font-mono placeholder:font-sans"
            maxLength={14}
          />
        </div>

        {/* Fetch Button */}
        <button 
          onClick={handleFetch}
          disabled={ulpin.length < 5 || loading}
          className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all mb-6"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Cuboid className="w-4 h-4" />
          )}
          {loading ? 'Rendering...' : 'Fetch 3D Terrain'}
        </button>

        {/* Dummy Results Section */}
        {results && (
          <div className="mt-2 mb-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 text-[#EF4444] font-bold text-sm mb-1">
                <AlertTriangle className="w-4 h-4" />
                Critical Breach Detected
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#94A3B8]">Permitted Depth:</span>
                  <span className="text-[#10B981] font-mono font-bold bg-[#10B981]/10 px-2 py-1 rounded">
                    {results.permitted} Meters
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#94A3B8]">Actual Depth:</span>
                  <span className="text-[#EF4444] font-mono font-bold bg-[#EF4444]/10 px-2 py-1 rounded shadow-[0_0_10px_rgba(239,68,68,0.2)] border border-[#EF4444]/30">
                    {results.actual} Meters
                  </span>
                </div>

                <div className="w-full bg-[#0B0F17] rounded-full h-1.5 overflow-hidden flex">
                  <div className="bg-[#10B981] h-1.5" style={{ width: `${(results.permitted / results.actual) * 100}%` }}></div>
                  <div className="bg-[#EF4444] h-1.5 flex-1 relative overflow-hidden">
                     <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EF4444]/20 flex flex-col gap-1">
                  <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Estimated Illegal Extraction</span>
                  <span className="text-[#EF4444] font-bold font-mono text-lg">
                    {results.illegalVolume.toLocaleString()} m³
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Button */}
        <div className="mt-6 pt-4 border-t border-[#1E293B]">
          <button 
            disabled={!results}
            className="w-full bg-[#1E293B] hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed text-[#0EA5E9] text-sm font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all border border-[#0EA5E9]/30"
          >
            <Download className="w-4 h-4" />
            Export Volumetric Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepthMapping;
