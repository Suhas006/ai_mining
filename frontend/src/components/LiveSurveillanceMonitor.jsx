import React, { useState, useEffect } from 'react';
import { Radar, Play, Pause, Radio, RefreshCw, Eye, ShieldAlert, Cpu, Activity, Clock, Zap, Maximize2, CheckCircle2, ArrowRight } from 'lucide-react';
import { getSatelliteImage } from '../utils/satelliteImageAssets';

export default function LiveSurveillanceMonitor({ leases = [], anomalies = [], onTriggerScan, onNavigateTriage, onOpen3DPit }) {
  const [isAutoScanning, setIsAutoScanning] = useState(true);
  const [timelineIndex, setTimelineIndex] = useState(2); // 0: T-30 Days, 1: T-15 Days, 2: T-0 Today
  const [pitchTriggerActive, setPitchTriggerActive] = useState(false);
  const [pitchStep, setPitchStep] = useState(0);

  const [t30Img, setT30Img] = useState('');
  const [t15Img, setT15Img] = useState('');
  const [t0Img, setT0Img] = useState('');

  useEffect(() => {
    setT30Img(getSatelliteImage('t30'));
    setT15Img(getSatelliteImage('t15'));
    setT0Img(getSatelliteImage('t0'));
  }, []);

  const [liveLogs, setLiveLogs] = useState([
    { time: '17:30:12', msg: 'Sentinel-2B orbital pass completed over Karur Granite Belt (Tile 33N)', level: 'info' },
    { time: '17:30:18', msg: 'Cloud Masking & Orthorectification check: 0.1% cloud cover (Clear Sky)', level: 'success' },
    { time: '17:30:25', msg: 'Gemini 1.5 Flash Vision Interceptor: 4,850 sq.m breach detected in Lease TN-KRR-GRN-2024-009', level: 'alert' }
  ]);

  // Web Audio API High-Tech Sonar Radar Ping Chime (No external audio file needed!)
  const playRadarSonarPing = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.3); // High sonar ping

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('AudioContext sound warning:', e);
    }
  };

  // Pitch Demo Trigger Sequence with Audio & Visual Sonar Pulse
  const handleRunPitchTrigger = () => {
    setPitchTriggerActive(true);
    setPitchStep(1);
    playRadarSonarPing();

    // Step 1: Rapid Radar Pulse
    setTimeout(() => {
      setPitchStep(2);
      playRadarSonarPing();
      setLiveLogs(prev => [
        { time: new Date().toLocaleTimeString(), msg: '⚡ PITCH DEMO: Satellite Sentinel-2B Revisit Triggered over Karur AOI', level: 'info' },
        ...prev
      ]);
    }, 1200);

    // Step 2: Gemini Vision Processing Log
    setTimeout(() => {
      setPitchStep(3);
      playRadarSonarPing();
      setLiveLogs(prev => [
        { time: new Date().toLocaleTimeString(), msg: '🤖 Gemini 1.5 Flash Vision API Ingestion: Multimodal change detected past legal northern boundary marker #14', level: 'alert' },
        ...prev
      ]);
    }, 2800);

    // Step 3: Turf.js Area Extrusion & Ticket Created
    setTimeout(() => {
      setPitchStep(4);
      playRadarSonarPing();
      if (onTriggerScan) onTriggerScan(); // triggers AI scan execution
      setLiveLogs(prev => [
        { time: new Date().toLocaleTimeString(), msg: '🚨 BREACH CONFIRMED: 4,850 sq.m unpermitted granite bench removal. Case ticket pushed to Triage Queue!', level: 'alert' },
        ...prev
      ]);
    }, 4200);
  };

  const timelineDates = [
    { label: 'T-30 Days (Baseline)', date: '25 July 2026', img: t30Img, breach: '0 sq.m (Clean Legal Boundary)' },
    { label: 'T-15 Days (Clearing)', date: '10 August 2026', img: t15Img, breach: '1,200 sq.m (Vegetation Clearing Started)' },
    { label: 'T-0 Today (Breach Flagged)', date: '25 August 2026', img: t0Img, breach: '4,850 sq.m (Unpermitted Pit Bench Removal)' }
  ];

  const currentTimeline = timelineDates[timelineIndex];

  return (
    <div className="bg-[#131B2B] border border-[#1E293B] rounded-lg p-6 shadow-2xl space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 rounded-lg text-[#0EA5E9]">
            <Radar className={`w-6 h-6 ${pitchTriggerActive ? 'animate-spin text-[#EF4444]' : 'animate-spin'}`} style={{ animationDuration: pitchTriggerActive ? '1.2s' : '6s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Live Satellite Orbit & Radar Monitor</h2>
              <span className="flex items-center gap-1 bg-[#10B981]/20 text-[#10B981] text-[10px] font-mono px-2 py-0.5 rounded border border-[#10B981]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping"></span>
                ORBITAL SCAN ACTIVE
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">Real-time Satellite Revisit Telemetry & Autonomous AI Sentinel Interceptor</p>
          </div>
        </div>

        {/* Action Pitch Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpen3DPit}
            className="flex items-center gap-2 bg-[#131B2B] hover:bg-[#1E293B] text-[#0EA5E9] border border-[#0EA5E9]/40 text-xs font-bold px-3 py-2 rounded transition-all shadow"
          >
            <Maximize2 className="w-4 h-4" />
            Launch 3D Pit Terrain Depth
          </button>

          <button
            onClick={handleRunPitchTrigger}
            disabled={pitchTriggerActive && pitchStep < 4}
            className="flex items-center gap-2 bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold px-4 py-2 rounded shadow-lg shadow-[#EF4444]/30 transition-all animate-pulse"
          >
            <Zap className="w-4 h-4" />
            {pitchStep > 0 && pitchStep < 4 ? `Scanning Orbit Step ${pitchStep}/4...` : '⚡ Simulate Satellite Revisit Pass'}
          </button>
        </div>
      </div>

      {/* Live Pitch Banner Notification */}
      {pitchStep === 4 && (
        <div className="bg-[#EF4444]/15 border border-[#EF4444]/40 p-4 rounded-lg flex items-center justify-between shadow-xl animate-bounce">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-[#EF4444]" />
            <div>
              <span className="font-bold text-white text-sm block">⚡ REAL-TIME SATELLITE INTERCEPT CONFIRMED!</span>
              <span className="text-xs text-[#94A3B8]">4,850 sq.m unpermitted granite bench removal past legal buffer. Ticket pushed to Triage Queue.</span>
            </div>
          </div>
          <button
            onClick={onNavigateTriage}
            className="flex items-center gap-1.5 bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold px-4 py-2 rounded shadow"
          >
            Open Incident Triage Queue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Monitoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Radar Feed & Timeline Playback */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Main Visual Monitor Frame */}
          <div className="relative h-[420px] bg-[#0B0F17] rounded-lg border border-[#1E293B] overflow-hidden group shadow-2xl">
            <img
              src={currentTimeline.img}
              alt="Satellite Telemetry"
              className="w-full h-full object-cover opacity-90 transition-all duration-500"
            />

            {/* Sonar Radar Overlay Sweep Animation */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div
                className={`w-[450px] h-[450px] rounded-full border border-[#0EA5E9]/40 relative ${
                  pitchStep > 0 ? 'border-[#EF4444]/80' : ''
                }`}
                style={{
                  background: pitchStep > 0
                    ? 'conic-gradient(from 0deg, rgba(239, 68, 68, 0.45) 0deg, transparent 90deg)'
                    : 'conic-gradient(from 0deg, rgba(14, 165, 233, 0.3) 0deg, transparent 60deg)',
                  animation: `spin ${pitchStep > 0 ? '1s' : '4s'} linear infinite`
                }}
              />
            </div>

            {/* 2D/3D Polygon Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-48 border-2 border-[#0EA5E9] bg-[#0EA5E9]/10 rounded flex items-center justify-center relative">
                <span className="text-[10px] font-mono text-white bg-[#131B2B]/90 px-2 py-0.5 rounded border border-[#0EA5E9]">
                  LEGAL PERIMETER: TN-KRR-GRN-2024-009
                </span>
                
                {/* Crimson Breach Polygon */}
                {(timelineIndex === 2 || pitchStep >= 3) && (
                  <div className="absolute -top-6 -right-6 w-28 h-24 border-2 border-[#EF4444] bg-[#EF4444]/40 animate-pulse rounded flex items-center justify-center">
                    <span className="text-[9px] font-mono text-white font-bold bg-[#EF4444] px-1.5 py-0.5 rounded shadow">
                      +4,850 sq.m BREACH
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Live Feed Header Overlay */}
            <div className="absolute top-3 left-3 bg-[#131B2B]/90 backdrop-blur-md border border-[#1E293B] px-3 py-1.5 rounded-md text-xs font-mono flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-white font-bold">
                <Radio className="w-4 h-4 text-[#EF4444] animate-pulse" />
                CAM-01 • SENTINEL-2B RASTER FEED
              </span>
              <span className="text-[#0EA5E9]">GSD: 0.5m</span>
              <span className="text-[#10B981]">SUN ELEV: 58.4°</span>
            </div>

            {/* Live Feed Telemetry HUD Overlay Bottom */}
            <div className="absolute bottom-3 left-3 right-3 bg-[#131B2B]/90 backdrop-blur-md border border-[#1E293B] p-3 rounded-md flex flex-wrap items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[#94A3B8] block text-[10px]">CURRENT TIMELINE FRAME</span>
                <span className="text-white font-bold text-sm">{currentTimeline.label} ({currentTimeline.date})</span>
              </div>
              <div className="text-right">
                <span className="text-[#94A3B8] block text-[10px]">UNCERTIFIED BREACH AREA</span>
                <span className="text-[#EF4444] font-bold text-sm">{currentTimeline.breach}</span>
              </div>
            </div>
          </div>

          {/* Time-Series Slider Control */}
          <div className="bg-[#0B0F17] border border-[#1E293B] p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
              <span className="flex items-center gap-1.5 font-bold text-white">
                <Clock className="w-4 h-4 text-[#0EA5E9]" />
                Satellite Time-Series Revisit Slider
              </span>
              <span>Frame {timelineIndex + 1} of 3</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {timelineDates.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => setTimelineIndex(idx)}
                  className={`p-2 rounded text-left transition-all border ${
                    timelineIndex === idx
                      ? 'bg-[#0EA5E9]/20 border-[#0EA5E9] text-white'
                      : 'bg-[#131B2B] border-[#1E293B] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <span className="text-[10px] font-bold block uppercase">{t.label}</span>
                  <span className="text-[11px] font-mono block text-white">{t.date}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Radar Telemetry Stats & Incident Logs */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="bg-[#0B0F17] border border-[#1E293B] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#10B981]" />
                Orbital Telemetry Specs
              </span>
              <span className="text-[10px] text-[#10B981] font-mono">NOMINAL</span>
            </div>

            <div className="space-y-2 text-xs font-mono text-[#94A3B8]">
              <div className="flex justify-between py-1 border-b border-[#1E293B]/50">
                <span>Constellation:</span>
                <span className="text-white font-bold">Sentinel-2B / PlanetScope</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E293B]/50">
                <span>Orbits Filter:</span>
                <span className="text-white font-bold">Sun-Synchronous (786 km)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E293B]/50">
                <span>Spectral Bands:</span>
                <span className="text-[#0EA5E9] font-bold">B2, B3, B4, B8 (NIR)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E293B]/50">
                <span>Cloud Mask Threshold:</span>
                <span className="text-[#10B981] font-bold">&lt; 5.0% (Clear Sky)</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Gemini API Version:</span>
                <span className="text-white font-bold">1.5 Flash Vision</span>
              </div>
            </div>
          </div>

          {/* Live Incident Log Ticker */}
          <div className="bg-[#0B0F17] border border-[#1E293B] rounded-lg p-4 space-y-3 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#0EA5E9]" />
                Live Sentinel Stream Log
              </span>
              <span className="text-[10px] text-[#94A3B8] font-mono">Auto-Updating</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-[11px] pr-1">
              {liveLogs.map((log, i) => (
                <div
                  key={i}
                  className={`p-2 rounded border text-left space-y-0.5 ${
                    log.level === 'alert'
                      ? 'bg-[#EF4444]/10 border-[#EF4444]/40 text-[#EF4444]'
                      : log.level === 'success'
                      ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                      : 'bg-[#131B2B] border-[#1E293B] text-[#94A3B8]'
                  }`}
                >
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>[{log.time}]</span>
                    <span>{log.level.toUpperCase()}</span>
                  </div>
                  <p className="text-white text-[11px] leading-tight">{log.msg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
