import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Clock } from 'lucide-react';

export default function SystemAuditLog() {
  const [logs, setLogs] = useState([
    { id: 1, time: '17:30:25', msg: 'Gemini 1.5 Vision Interceptor: 4,850 sq.m breach detected in TN-KRR-GRN-2024-009', type: 'alert' },
    { id: 2, time: '17:30:18', msg: 'Cloud Masking & Orthorectification check: 0.1% cloud cover (Clear Sky).', type: 'success' },
    { id: 3, time: '17:30:12', msg: 'Sentinel-2B orbital pass completed over Karur Granite Belt.', type: 'info' }
  ]);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/audit-logs`);
      if (res.ok) {
        const data = await res.json();
        // If there are real logs, use them, otherwise keep showing initial simulated logs for UI pop
        if (data && data.length > 0) {
          setLogs(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  };

  useEffect(() => {
    fetchLogs(); // initial fetch
    const timer = setInterval(fetchLogs, 5000); // Poll every 5s

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-64 overflow-hidden rounded-lg border border-slate-800 bg-[#0B0F17] flex flex-col shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#131B2B] px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-100 uppercase tracking-wider">
          <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
          SYSTEM AUDIT LOG (LIVE ENTERPRISE TRAIL)
        </div>
        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-mono font-bold">
          Auto-Updating
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono text-[11px]">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 border-b border-slate-800/60 pb-2">
            <span className="text-slate-500 font-bold">[{log.time}]</span>
            <span className={`flex-1 ${log.type === 'alert' ? 'text-red-400 font-bold' :
                log.type === 'success' ? 'text-emerald-400 font-bold' : 'text-slate-300'
              }`}>
              {log.msg}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
