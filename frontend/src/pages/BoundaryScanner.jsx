import React, { useState, useRef } from 'react';
import MapView from '../components/MapView';
import { UploadCloud, CheckCircle, Search, UserCheck } from 'lucide-react';
import axios from 'axios';

const BoundaryScanner = ({ parcels, leases, anomalies, sessionScannedBoundaries, onScanSuccess, onSelectAnomaly, onGeneratePDF, fetchLayers }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleScan = async () => {
    if (!file) return;

    setLoading(true);

    // 🌟 Capture live mobile browser GPS as a foolproof backup
    let browserLat = null;
    let browserLng = null;
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      browserLat = position.coords.latitude;
      browserLng = position.coords.longitude;
    } catch (err) {
      console.log("Browser geolocation unavailable, relying on image metadata.");
    }

    const formData = new FormData();
    formData.append('file', file);
    if (browserLat && browserLng) {
      formData.append('lat', browserLat);
      formData.append('lng', browserLng);
    }

    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://ai-mining.onrender.com';

      const response = await axios.post(`${backendUrl}/api/ai/analyze-raster`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const backendData = response.data;
      const realArea = backendData.detected_area || 0;

      let realConfidence = 0;
      if (backendData.anomalies && backendData.anomalies.length > 0) {
        realConfidence = (backendData.anomalies[0].confidence * 100).toFixed(1);
      } else {
        realConfidence = 99.9;
      }

      setResults({
        confidence: realConfidence,
        area: realArea
      });

      if (onScanSuccess && backendData.anomalies && backendData.anomalies.length > 0) {
        onScanSuccess(backendData.anomalies[0]);
      }

      if (fetchLayers) fetchLayers();
      setLoading(false);

    } catch (error) {
      console.error("Upload failed:", error);
      alert(error.response?.data?.details || "Scan failed.");
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-full p-2 gap-2 bg-[#0B0F17]">
      <div className="flex-[4] h-full rounded-[32px] overflow-hidden shadow-2xl border border-[#1E293B]">
        <MapView
          parcels={parcels}
          leases={leases}
          anomalies={anomalies}
          scannedBoundaries={sessionScannedBoundaries}
          onSelectAnomaly={onSelectAnomaly}
          onGeneratePDF={onGeneratePDF}
        />
      </div>

      <div className="flex-[1] h-full bg-[#131B2B] rounded-xl border border-[#1E293B] shadow-2xl p-5 flex flex-col overflow-y-auto">
        <h2 className="text-white font-bold text-lg mb-1">2D AI Scanner</h2>
        <p className="text-xs text-[#94A3B8] mb-6">Analyze raster imagery for automated land boundary extraction.</p>

        <div
          className="border-2 border-dashed border-[#1E293B] hover:border-[#0EA5E9] bg-[#0B0F17] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors mb-4"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
          />
          <UploadCloud className={`w-8 h-8 mb-3 ${file ? 'text-[#10B981]' : 'text-[#0EA5E9]'}`} />
          <p className="text-sm font-medium text-white mb-1">
            {file ? file.name : 'Upload Satellite Image'}
          </p>
          <p className="text-[10px] text-[#94A3B8]">
            {file ? 'Click or drag to replace' : 'Drag and drop or click to browse'}
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={!file || loading}
          className="w-full bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] hover:from-[#38BDF8] hover:to-[#3B82F6] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all mb-6"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {loading ? 'Analyzing Raster...' : 'Scan Image'}
        </button>

        {results && (
          <div className="mt-2 mb-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-[#10B981] font-bold text-sm mb-2">
                <CheckCircle className="w-4 h-4" />
                Scan Complete
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#94A3B8]">Confidence:</span>
                  <span className="text-white font-mono">{results.confidence}%</span>
                </div>
                <div className="w-full bg-[#0B0F17] rounded-full h-1.5">
                  <div className="bg-[#10B981] h-1.5 rounded-full" style={{ width: `${results.confidence}%` }}></div>
                </div>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-[#10B981]/20">
                <span className="text-[#94A3B8]">Calculated Area:</span>
                <span className="text-[#EF4444] font-bold font-mono">{results.area} sq meters</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#1E293B]">
          <button
            disabled={!results}
            className="w-full bg-[#1E293B] hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all border border-[#334155]"
          >
            <UserCheck className="w-4 h-4 text-[#10B981]" />
            Assign to Surveyor
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoundaryScanner;