import React, { useState, useEffect, useRef } from 'react';
import { Box, RotateCw, ArrowDown, ShieldAlert, Layers, CheckCircle2, RefreshCw } from 'lucide-react';

export default function ThreeDPitViewer({ anomaly, lease, onClose }) {
  const canvasRef = useRef(null);
  const [yaw, setYaw] = useState(45); // rotation angle around Y
  const [pitch, setPitch] = useState(35); // tilt angle around X
  const [pitDepth, setPitDepth] = useState(17); // meters past legal limit
  const [isRotating, setIsRotating] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const breachAreaSqM = anomaly?.breachAreaSqMeters || 4850;
  const legalDepthMeters = 15;
  const totalDepthMeters = legalDepthMeters + pitDepth;
  const pitVolumeM3 = breachAreaSqM * pitDepth;
  const estimatedMetricTons = Math.round(pitVolumeM3 * 2.5); // 2.5 tons per m3 granite
  const penaltyDemandINR = estimatedMetricTons * 2500;

  // Auto-rotate 3D mesh when active
  useEffect(() => {
    let animId;
    if (isRotating && !isDragging) {
      const loop = () => {
        setYaw(prev => (prev + 0.8) % 360);
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animId);
  }, [isRotating, isDragging]);

  // Mouse Drag handlers for 360° Orbit Rotation
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    setYaw(prev => (prev + deltaX * 0.8) % 360);
    setPitch(prev => Math.max(10, Math.min(80, prev + deltaY * 0.4)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Render 3D Iso Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width || 520;
    const height = canvas.height || 400;

    // Fill background solid dark obsidian
    ctx.fillStyle = '#0B0F17';
    ctx.fillRect(0, 0, width, height);

    // Center coordinates
    const cx = width / 2;
    const cy = height / 2 + 10;

    // 3D Isometric Projection math
    const radYaw = (yaw * Math.PI) / 180;
    const radPitch = (pitch * Math.PI) / 180;

    const project3D = (x, y, z) => {
      const rx = x * Math.cos(radYaw) - z * Math.sin(radYaw);
      const rz = x * Math.sin(radYaw) + z * Math.cos(radYaw);

      const ry = y * Math.cos(radPitch) - rz * Math.sin(radPitch);
      const rz2 = y * Math.sin(radPitch) + rz * Math.cos(radPitch);

      const px = cx + rx;
      const py = cy + ry + rz2 * 0.35;
      return { x: px, y: py };
    };

    // 1. Draw Ground Level Spatial Grid Lines
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.lineWidth = 1;
    const gridSize = 160;
    const gridStep = 25;

    for (let g = -gridSize; g <= gridSize; g += gridStep) {
      const p1 = project3D(g, 0, -gridSize);
      const p2 = project3D(g, 0, gridSize);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      const p3 = project3D(-gridSize, 0, g);
      const p4 = project3D(gridSize, 0, g);
      ctx.beginPath();
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.stroke();
    }

    // 2. Draw Legal Permitted Extraction Box (Cyan Wireframe)
    const boxW = 140;
    const boxH = 100;
    const legalH = legalDepthMeters * 3.5;

    // Top Ground Level 0m
    const t1 = project3D(-boxW / 2, 0, -boxH / 2);
    const t2 = project3D(boxW / 2, 0, -boxH / 2);
    const t3 = project3D(boxW / 2, 0, boxH / 2);
    const t4 = project3D(-boxW / 2, 0, boxH / 2);

    // Legal Floor -15m
    const l1 = project3D(-boxW / 2, legalH, -boxH / 2);
    const l2 = project3D(boxW / 2, legalH, -boxH / 2);
    const l3 = project3D(boxW / 2, legalH, boxH / 2);
    const l4 = project3D(-boxW / 2, legalH, boxH / 2);

    // Fill Legal Top Surface (Cyan)
    ctx.fillStyle = 'rgba(14, 165, 233, 0.25)';
    ctx.strokeStyle = '#0EA5E9';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(t1.x, t1.y);
    ctx.lineTo(t2.x, t2.y);
    ctx.lineTo(t3.x, t3.y);
    ctx.lineTo(t4.x, t4.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Legal Vertical Pillars
    [
      [t1, l1], [t2, l2], [t3, l3], [t4, l4]
    ].forEach(([from, to]) => {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    });

    // Legal Floor Perimeter
    ctx.beginPath();
    ctx.moveTo(l1.x, l1.y);
    ctx.lineTo(l2.x, l2.y);
    ctx.lineTo(l3.x, l3.y);
    ctx.lineTo(l4.x, l4.y);
    ctx.closePath();
    ctx.stroke();

    // 3. Draw Unpermitted Pit Depth Extrusion (Glowing Crimson Red)
    const pitW = 85;
    const pitH = 70;
    const breachH = legalH + pitDepth * 4.5;

    // Pit Top at Legal Floor Level
    const p1 = project3D(-pitW / 2 + 25, legalH, -pitH / 2);
    const p2 = project3D(pitW / 2 + 25, legalH, -pitH / 2);
    const p3 = project3D(pitW / 2 + 25, legalH, pitH / 2);
    const p4 = project3D(-pitW / 2 + 25, legalH, pitH / 2);

    // Deep Pit Floor at Unpermitted Depth (-32m to -55m)
    const b1 = project3D(-pitW / 2 + 25, breachH, -pitH / 2);
    const b2 = project3D(pitW / 2 + 25, breachH, -pitH / 2);
    const b3 = project3D(pitW / 2 + 25, breachH, pitH / 2);
    const b4 = project3D(-pitW / 2 + 25, breachH, pitH / 2);

    // Extruded Side Walls
    ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;

    const walls = [
      [p1, p2, b2, b1],
      [p2, p3, b3, b2],
      [p3, p4, b4, b3],
      [p4, p1, b1, b4]
    ];

    walls.forEach(w => {
      ctx.beginPath();
      ctx.moveTo(w[0].x, w[0].y);
      ctx.lineTo(w[1].x, w[1].y);
      ctx.lineTo(w[2].x, w[2].y);
      ctx.lineTo(w[3].x, w[3].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Deep Pit Base Floor
    ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.beginPath();
    ctx.moveTo(b1.x, b1.y);
    ctx.lineTo(b2.x, b2.y);
    ctx.lineTo(b3.x, b3.y);
    ctx.lineTo(b4.x, b4.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Text Annotations
    ctx.fillStyle = '#0EA5E9';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.fillText('LEGAL EXTRACTION FLOOR (-15m)', t2.x + 10, t2.y);

    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.fillText(`UNPERMITTED PIT EXCAVATION (-${totalDepthMeters}m)`, b2.x + 10, b2.y);

  }, [yaw, pitch, pitDepth]);

  return (
    <div className="fixed inset-0 z-[5000] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="bg-[#131B2B] border-2 border-[#0EA5E9]/50 rounded-xl max-w-5xl w-full p-6 shadow-2xl space-y-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#EF4444]/20 border border-[#EF4444]/40 rounded-lg text-[#EF4444]">
              <Box className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">UNIFIED 3D TERRAIN & PIT DEPTH EXTRUSION</h2>
                <span className="bg-[#EF4444]/20 text-[#EF4444] text-[10px] font-mono px-2 py-0.5 rounded border border-[#EF4444]/40 font-bold uppercase">
                  3D PIT BENCH DETECTED
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">Leaseholder: Kaveri Black Granite Leases Ltd (TN-KRR-GRN-2024-009)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white bg-[#EF4444] hover:bg-[#DC2626] text-xs font-bold px-4 py-2 rounded shadow-lg transition-all"
          >
            ✕ Close 3D Viewer
          </button>
        </div>

        {/* 3D Canvas & Volumetric Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 3D Canvas View Frame */}
          <div className="lg:col-span-7 bg-[#0B0F17] border border-[#1E293B] rounded-lg p-3 relative flex flex-col items-center justify-center min-h-[380px]">
            <canvas
              ref={canvasRef}
              width={520}
              height={380}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-80 object-contain cursor-grab active:cursor-grabbing rounded bg-[#0B0F17]"
            />

            {/* Orbit Rotation Indicator */}
            <div className="absolute top-3 left-3 bg-[#131B2B]/90 backdrop-blur border border-[#1E293B] px-3 py-1.5 rounded text-[11px] font-mono text-[#0EA5E9] flex items-center gap-2 shadow">
              <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
              <span>Click & Drag to Rotate 3D • Yaw: {Math.round(yaw)}° • Pitch: {Math.round(pitch)}°</span>
            </div>

            <button
              onClick={() => setIsRotating(!isRotating)}
              className="absolute bottom-3 right-3 bg-[#131B2B] hover:bg-[#1E293B] text-white text-[11px] font-bold px-3 py-1.5 rounded border border-[#1E293B] transition-all"
            >
              {isRotating ? 'Pause Auto-Rotate' : 'Auto Rotate 3D'}
            </button>
          </div>

          {/* Right Column: 3D Volumetric Telemetry */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            
            {/* Interactive Depth Slider */}
            <div className="bg-[#0B0F17] border border-[#1E293B] p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowDown className="w-4 h-4 text-[#EF4444]" />
                  Simulate Unpermitted Pit Depth Extrusion
                </span>
                <span className="font-mono text-[#EF4444] font-bold text-sm">+{pitDepth} meters</span>
              </div>

              <input
                type="range"
                min="5"
                max="40"
                value={pitDepth}
                onChange={(e) => setPitDepth(Number(e.target.value))}
                className="w-full accent-[#EF4444] cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono">
                <span>Legal Floor (-15m)</span>
                <span>Max Extruded Depth (-55m)</span>
              </div>
            </div>

            {/* Volumetric Breakdown */}
            <div className="bg-[#0B0F17] border border-[#1E293B] p-4 rounded-lg space-y-2.5 text-xs font-mono">
              <div className="font-bold text-white uppercase text-[11px] border-b border-[#1E293B] pb-1.5 flex items-center justify-between">
                <span>3D Pit Volumetric Calculations</span>
                <span className="text-[#0EA5E9]">ISO 19152 STDM</span>
              </div>

              <div className="flex justify-between text-[#94A3B8]">
                <span>Surface Breach Area:</span>
                <span className="text-white font-bold">{breachAreaSqM.toLocaleString()} sq.m</span>
              </div>

              <div className="flex justify-between text-[#94A3B8]">
                <span>Extruded Pit Depth:</span>
                <span className="text-[#EF4444] font-bold">{pitDepth} meters past limit</span>
              </div>

              <div className="flex justify-between text-[#94A3B8]">
                <span>Total 3D Excavated Pit Volume:</span>
                <span className="text-white font-bold">{pitVolumeM3.toLocaleString()} m³</span>
              </div>

              <div className="flex justify-between text-[#94A3B8]">
                <span>Est. Extracted Granite Tonnage:</span>
                <span className="text-[#F59E0B] font-bold">{estimatedMetricTons.toLocaleString()} Metric Tons</span>
              </div>

              <div className="pt-2 border-t border-[#1E293B] flex justify-between items-center">
                <span className="text-white font-bold">Penalty Demand (₹2,500/ton):</span>
                <span className="text-base font-bold text-[#EF4444]">₹{(penaltyDemandINR / 10000000).toFixed(2)} Cr</span>
              </div>
            </div>

            <div className="bg-[#EF4444]/15 border border-[#EF4444]/40 p-3 rounded text-[11px] text-[#EF4444] font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>3D volumetric pit depth verified past permitted quarry floor line. Compounding penalty ready for dispatch.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
