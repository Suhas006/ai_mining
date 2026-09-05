import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Scan, ArrowRight, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex-1 bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#10B981]/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#F97316]/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header Section */}
      <div className="w-full max-w-6xl z-10 mb-16 animate-in fade-in slide-in-from-top-8 duration-700">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-[#94A3B8] font-mono text-sm tracking-widest uppercase mb-2">
            <ShieldCheck className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            <span>Secure Access Grid</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 dark:from-white dark:via-gray-300 dark:to-gray-500 bg-clip-text text-transparent drop-shadow-sm">
            DepthFence Enterprise Grid
          </h1>
          <p className="text-slate-500 dark:text-[#94A3B8] text-lg md:text-xl font-light max-w-2xl mx-auto border-t border-slate-200 dark:border-white/10 pt-4">
            Ministry of Rural Development &bull; Smart India Hackathon Solutions
          </p>
        </div>
      </div>

      {/* Grid Layout for Cards */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 z-10">
        
        {/* Card 1: 3D Volumetric Cadastre */}
        <div 
          onClick={() => navigate('/3d-mapping')}
          className="group relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 dark:backdrop-blur-xl rounded-2xl p-8 cursor-pointer overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 shadow-sm dark:shadow-none"
        >
          {/* Internal gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/0 via-transparent to-[#06B6D4]/0 group-hover:from-[#10B981]/5 dark:group-hover:from-[#10B981]/10 group-hover:to-[#06B6D4]/5 dark:group-hover:to-[#06B6D4]/10 transition-all duration-500"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-16 h-16 rounded-xl bg-[#10B981]/10 dark:bg-[#10B981]/20 border border-[#10B981]/20 dark:border-[#10B981]/30 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <Box className="w-8 h-8 text-[#10B981]" />
            </div>
            
            <h2 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-[#10B981] transition-colors">
              3D Volumetric Cadastre
            </h2>
            <div className="text-xs font-mono text-[#10B981] bg-[#10B981]/10 inline-flex px-3 py-1 rounded-full mb-4 w-max border border-[#10B981]/20">
              SIH26011
            </div>
            
            <p className="text-slate-500 dark:text-[#94A3B8] leading-relaxed flex-grow">
              Z-Axis Measurement & 3D ULPIN Generation. Map vertical boundaries in high-density urban environments with absolute precision.
            </p>
            
            <div className="mt-8 flex items-center justify-between text-sm font-bold text-slate-400 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              <span>INITIALIZE MODULE</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 text-[#10B981]" />
            </div>
          </div>
        </div>

        {/* Card 2: GeoAI Boundary Extractor */}
        <div 
          onClick={() => navigate('/2d-scanner')}
          className="group relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 dark:backdrop-blur-xl rounded-2xl p-8 cursor-pointer overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(249,115,22,0.15)] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 shadow-sm dark:shadow-none"
        >
          {/* Internal gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#F97316]/0 via-transparent to-[#3B82F6]/0 group-hover:from-[#F97316]/5 dark:group-hover:from-[#F97316]/10 group-hover:to-[#3B82F6]/5 dark:group-hover:to-[#3B82F6]/10 transition-all duration-500"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-16 h-16 rounded-xl bg-[#F97316]/10 dark:bg-[#F97316]/20 border border-[#F97316]/20 dark:border-[#F97316]/30 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <Scan className="w-8 h-8 text-[#F97316]" />
            </div>
            
            <h2 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-[#F97316] transition-colors">
              GeoAI Boundary Extractor
            </h2>
            <div className="text-xs font-mono text-[#F97316] bg-[#F97316]/10 inline-flex px-3 py-1 rounded-full mb-4 w-max border border-[#F97316]/20">
              SIH26012
            </div>
            
            <p className="text-slate-500 dark:text-[#94A3B8] leading-relaxed flex-grow">
              Automated Drone Raster Extraction & GeoJSON Export. Rapidly delineate cadastral boundaries using edge AI vision models.
            </p>
            
            <div className="mt-8 flex items-center justify-between text-sm font-bold text-slate-400 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              <span>INITIALIZE MODULE</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 text-[#F97316]" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
