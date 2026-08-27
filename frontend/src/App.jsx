import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MetricsHeader from './components/MetricsHeader';
import MapView from './components/MapView';
import AnomalyTriage from './components/AnomalyTriage';
import LiveSurveillanceMonitor from './components/LiveSurveillanceMonitor';
import ThreeDPitViewer from './components/ThreeDPitViewer';
import ParcelRegisterModal from './components/ParcelRegisterModal';
import AISurveillanceAnalyzer from './components/AISurveillanceAnalyzer';
import FieldInspectionSim from './components/FieldInspectionSim';
import LegalNoticeModal from './components/LegalNoticeModal';
import ParcelsDetailModal from './components/ParcelsDetailModal';
import LeasesDetailModal from './components/LeasesDetailModal';
import EncroachmentDetailModal from './components/EncroachmentDetailModal';
import SystemAuditLog from './components/SystemAuditLog';
import AuthModal from './components/AuthModal';

// --- SOVEREIGN AI IMPORT ---
import SovereignAIUploader from './components/SovereignAIUploader';

export default function App() {
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'monitor' | 'triage'
  const [isDaytimeMode, setIsDaytimeMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [leases, setLeases] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isFieldSimOpen, setIsFieldSimOpen] = useState(false);
  const [is3DPitOpen, setIs3DPitOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedAnomalyForPDF, setSelectedAnomalyForPDF] = useState(null);

  // Metric Cards Detail Modals
  const [isParcelsModalOpen, setIsParcelsModalOpen] = useState(false);
  const [isLeasesModalOpen, setIsLeasesModalOpen] = useState(false);
  const [isEncroachmentModalOpen, setIsEncroachmentModalOpen] = useState(false);

  // Fetch overview layers from backend
  const fetchLayers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/gis/overview-layers`);
      if (res.ok) {
        const data = await res.json();
        setParcels(data.parcels || []);
        setLeases(data.leases || []);
        setAnomalies(data.anomalies || []);
        setInspections(data.inspections || []);
        setOfficers(data.officers || []);
      }
    } catch (err) {
      console.error('Failed to fetch GIS layers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayers();
  }, []);

  const handleUpdateAnomalyStatus = async (id, status) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/anomalies/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchLayers();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleAssignOfficer = async (id, officerId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/anomalies/${id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerId })
      });
      if (res.ok) fetchLayers();
    } catch (err) {
      console.error('Officer assignment failed:', err);
    }
  };

  return (
    <div className={`min-h-screen ${isDaytimeMode ? 'bg-slate-50 text-slate-900' : 'bg-[#0B0F17] text-[#F8FAFC]'} flex flex-col transition-colors duration-300`}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpen3DPit={() => setIs3DPitOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenAIAnalyzer={() => setIsAIOpen(true)}
        onOpenFieldSim={() => setIsFieldSimOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        anomalyCount={anomalies.filter(a => a.status === 'Pending_Inspection').length}
        currentUser={currentUser}
        isDaytimeMode={isDaytimeMode}
        onToggleTheme={() => setIsDaytimeMode(!isDaytimeMode)}
      />

      {/* Main Command & Control Center */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Metric Header Cards */}
        <MetricsHeader
          parcels={parcels}
          leases={leases}
          anomalies={anomalies}
          onOpenParcels={() => setIsParcelsModalOpen(true)}
          onOpenLeases={() => setIsLeasesModalOpen(true)}
          onNavigateTriage={() => setActiveTab('triage')}
          onOpenEncroachment={() => setIsEncroachmentModalOpen(true)}
        />

        {/* Tab View Switching */}
        {activeTab === 'monitor' ? (
          <LiveSurveillanceMonitor
            leases={leases}
            anomalies={anomalies}
            onTriggerScan={() => setIsAIOpen(true)}
            onNavigateTriage={() => setActiveTab('triage')}
            onOpen3DPit={() => setIs3DPitOpen(true)}
          />
        ) : activeTab === 'map' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wide">Command GIS Map View</h2>
                <p className="text-xs text-[#94A3B8]">Sub-meter GeoJSON Spatial Layer Rendering & Spatial Breach Inspection</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIs3DPitOpen(true)}
                  className="bg-[#0EA5E9]/20 text-[#0EA5E9] border border-[#0EA5E9]/40 text-xs font-bold px-3 py-1.5 rounded hover:bg-[#0EA5E9]/30 transition-all"
                >
                  📦 Launch 3D Terrain & Pit Depth
                </button>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span>
                  <span className="text-[#10B981]">Karur Surveillance Zone Active</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3">
                <MapView
                  parcels={parcels}
                  leases={leases}
                  anomalies={anomalies}
                  onSelectAnomaly={(anomaly) => {
                    setSelectedAnomalyForPDF(anomaly);
                    setActiveTab('triage');
                  }}
                  onGeneratePDF={(id) => {
                    const item = anomalies.find(a => a._id === id) || anomalies[0];
                    setSelectedAnomalyForPDF(item);
                  }}
                />
              </div>

              {/* --- RIGHT SIDEBAR COLUMN WITH UPLOADER & LOGS --- */}
              <div className="xl:col-span-1 space-y-6">

                {/* PASSED fetchLayers AS A LIVE CALLBACK */}
                <SovereignAIUploader onScanComplete={fetchLayers} />

                <SystemAuditLog />
              </div>
            </div>
          </div>
        ) : (
          <AnomalyTriage
            anomalies={anomalies}
            officers={officers}
            onUpdateStatus={handleUpdateAnomalyStatus}
            onAssignOfficer={handleAssignOfficer}
            onGeneratePDF={(id) => {
              const item = anomalies.find(a => a._id === id) || anomalies[0];
              setSelectedAnomalyForPDF(item);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#131B2B] border-t border-[#1E293B] py-4 px-6 text-center text-xs text-[#94A3B8] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GeoSuraksha Grid v2.0 • Submitted for Dr. Kalam Young Achiever Awards 2026</span>
          <span className="font-mono text-[#0EA5E9]">Turf.js Spatial Engine • Gemini 1.5 Flash Vision • 14-Digit ULPIN</span>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthOpen(false);
        }}
      />

      {is3DPitOpen && (
        <ThreeDPitViewer
          anomaly={anomalies[0]}
          lease={leases[0]}
          onClose={() => setIs3DPitOpen(false)}
        />
      )}

      <ParcelRegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegisterSuccess={() => {
          fetchLayers();
        }}
      />

      <AISurveillanceAnalyzer
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        leases={leases}
        onAnalysisComplete={() => {
          fetchLayers();
          setActiveTab('triage');
        }}
      />

      <FieldInspectionSim
        isOpen={isFieldSimOpen}
        onClose={() => setIsFieldSimOpen(false)}
        anomalies={anomalies}
        onInspectionSubmitted={() => {
          fetchLayers();
        }}
      />

      <LegalNoticeModal
        anomaly={selectedAnomalyForPDF}
        isOpen={!!selectedAnomalyForPDF}
        onClose={() => setSelectedAnomalyForPDF(null)}
      />

      <ParcelsDetailModal
        parcels={parcels}
        isOpen={isParcelsModalOpen}
        onClose={() => setIsParcelsModalOpen(false)}
      />

      <LeasesDetailModal
        leases={leases}
        isOpen={isLeasesModalOpen}
        onClose={() => setIsLeasesModalOpen(false)}
      />

      <EncroachmentDetailModal
        anomalies={anomalies}
        isOpen={isEncroachmentModalOpen}
        onClose={() => setIsEncroachmentModalOpen(false)}
        onNavigateTriage={() => setActiveTab('triage')}
      />
    </div>
  );
}