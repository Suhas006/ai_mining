import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Scan, AlertTriangle, Image as ImageIcon, Map, Activity, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Scanner2D = ({ onScanSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [results, setResults] = useState(null);
    const [depthMetrics, setDepthMetrics] = useState(null);
    const [isCalculatingZ, setIsCalculatingZ] = useState(false);

    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResults(null);
        }
    };

    const handleScan = async () => {
        if (!selectedFile) return;
        setScanning(true);
        setResults(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://ai-mining.onrender.com';
            const response = await fetch(`${backendUrl}/api/ai/analyze-raster`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.details || "Backend analysis failed");

            setResults(data);

            if (onScanSuccess && data.anomalies && data.anomalies.length > 0) {
                onScanSuccess(data.anomalies[0]);
            }

            setTimeout(() => {
                navigate('/');
            }, 1000);

        } catch (error) {
            console.error("AI Scan Error:", error);
            alert(error.message || "Failed to process image through AI Engine.");
        } finally {
            setScanning(false);
        }
    };

    const handleCalculateZAxis = async () => {
        if (!results || !results.anomalies || results.anomalies.length === 0) return;
        const polygon = results.anomalies[0].boundary_polygon;
        
        setIsCalculatingZ(true);
        setDepthMetrics(null);

        try {
            const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://ai-mining.onrender.com';
            const token = localStorage.getItem('depthfence_token');
            
            const response = await axios.post(`${backendUrl}/api/geo/calculate-z-axis`, { polygon }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setDepthMetrics(response.data);
        } catch (error) {
            console.error('Failed to calculate Z-Axis metrics', error);
            alert('Failed to interface with DEM Satellites.');
        } finally {
            setIsCalculatingZ(false);
        }
    };

    const getSvgPolygonPoints = (polygonArray) => {
        if (!polygonArray) return "";
        return polygonArray.map(point => `${point[0]},${point[1]}`).join(' ');
    };

    return (
        <div className="flex w-full h-full p-4 gap-4 bg-[#0B0F17]">
            <div className="flex-[4] h-full rounded-xl overflow-hidden shadow-2xl border border-[#1E293B] relative bg-[#0F172A] flex flex-col items-center justify-center">
                {!previewUrl && (
                    <div className="flex flex-col items-center text-[#475569]">
                        <ImageIcon className="w-20 h-20 mb-4 opacity-50" />
                        <p className="font-medium tracking-widest uppercase text-sm mb-4">Awaiting Satellite Raster Image</p>
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="bg-[#1E293B] hover:bg-[#334155] text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all border border-white/5"
                        >
                            <UploadCloud className="w-4 h-4" /> Browse Local Files
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                )}

                {previewUrl && (
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        <div className="relative inline-block max-w-full max-h-full">
                            <img
                                src={previewUrl}
                                alt="Satellite Raster"
                                className={`max-w-full max-h-[80vh] object-contain rounded border border-[#1E293B] transition-all duration-500 ${scanning ? 'brightness-50 grayscale contrast-125' : ''}`}
                            />
                            {results && results.anomalies && results.anomalies.length > 0 && results.anomalies[0].boundary_polygon && (
                                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <polygon points={getSvgPolygonPoints(results.anomalies[0].boundary_polygon)} className="fill-red-500/20 stroke-red-500 stroke-[0.5] animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" vectorEffect="non-scaling-stroke" />
                                </svg>
                            )}
                        </div>

                        {scanning && (
                            <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded">
                                <div className="w-full h-1 bg-[#0EA5E9] shadow-[0_0_15px_#0EA5E9] absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <Scan className="w-16 h-16 text-[#0EA5E9] animate-pulse mb-2 drop-shadow-[0_0_10px_rgba(14,165,233,0.8)]" />
                                    <span className="text-[#0EA5E9] font-mono text-xs font-bold tracking-widest bg-black/50 px-3 py-1 rounded border border-[#0EA5E9]/30">
                                        EXTRACTING CADASTRAL FEATURES...
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-[1] h-full bg-[#131B2B] rounded-xl border border-[#1E293B] shadow-2xl p-5 flex flex-col overflow-y-auto">
                <h2 className="text-white font-bold text-lg mb-1">Cadastral Feature Extractor</h2>
                <p className="text-xs text-[#94A3B8] mb-6">AI-driven automated property boundary extraction.</p>

                {previewUrl && (
                    <button
                        onClick={() => { setSelectedFile(null); setPreviewUrl(null); setResults(null); }}
                        className="w-full bg-[#0B0F17] hover:bg-[#1E293B] border border-[#1E293B] text-[#94A3B8] text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 mb-4 transition-all"
                    >
                        Clear Image
                    </button>
                )}

                <button
                    onClick={handleScan}
                    disabled={!selectedFile || scanning}
                    className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all mb-6"
                >
                    {scanning ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Scan className="w-4 h-4" />}
                    {scanning ? 'Processing Data...' : 'Extract Boundaries'}
                </button>

                {results && (
                    <div className="mt-2 mb-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-4">
                            <div className="flex items-center gap-2 text-red-500 font-bold text-sm mb-1">
                                <AlertTriangle className="w-4 h-4" /> Boundary Extracted
                            </div>
                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between pb-2 border-b border-white/10">
                                    <span className="text-[#94A3B8]">Confidence:</span>
                                    <span className="text-red-400 font-mono font-bold">{(results.anomalies[0].confidence * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex justify-between pb-2 border-b border-white/10">
                                    <span className="text-[#94A3B8]">Calculated Area:</span>
                                    <span className="text-red-400 font-mono font-bold">{results.detected_area} sq meters</span>
                                </div>
                            </div>
                        </div>

                        {/* Z-Axis Depth Calculator */}
                        {!depthMetrics ? (
                            <button
                                onClick={handleCalculateZAxis}
                                disabled={isCalculatingZ}
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 disabled:opacity-50 text-white text-xs font-bold py-3 px-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-400/50 mt-4"
                            >
                                {isCalculatingZ ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Interfacing with DEM...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Map className="w-4 h-4" />
                                        <span>Calculate Z-Axis Depth (3D)</span>
                                    </div>
                                )}
                            </button>
                        ) : (
                            <div className="mt-4 p-4 rounded-xl bg-[#0B0F17]/80 backdrop-blur-md border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)] relative overflow-hidden group">
                                <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[150%] bg-cyan-500/10 blur-[50px] pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700"></div>
                                <h4 className="text-cyan-400 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Volumetric Data Card
                                </h4>
                                <div className="space-y-3 relative z-10">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">Average Elevation</span>
                                        <span className="text-white font-mono font-bold bg-slate-800 px-2 py-0.5 rounded">{depthMetrics.averageElevation}m</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">Max Peak</span>
                                        <span className="text-emerald-400 font-mono font-bold bg-emerald-400/10 px-2 py-0.5 rounded">{depthMetrics.maxElevation}m</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">Maximum Depth</span>
                                        <span className="text-cyan-400 font-mono font-bold bg-cyan-400/10 px-2 py-0.5 rounded">{depthMetrics.minElevation}m</span>
                                    </div>
                                </div>
                                <div className="mt-3 pt-2 border-t border-cyan-500/20 text-[10px] text-slate-500 font-mono flex justify-between">
                                    <span>SRC: {depthMetrics.dataSource}</span>
                                    <span className="text-cyan-500 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Active</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Scanner2D;