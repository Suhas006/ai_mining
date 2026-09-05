import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import { ThemeProvider } from './context/ThemeContext';
import { LiveDataProvider } from './context/LiveDataContext';

import Sidebar from './components/Sidebar';
import BoundaryScanner from './pages/BoundaryScanner';
import DepthMapping from './pages/DepthMapping';
import Scanner2D from './pages/Scanner2D';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

import ThreeDPitViewer from './components/ThreeDPitViewer';
import ParcelRegisterModal from './components/ParcelRegisterModal';
import AISurveillanceAnalyzer from './components/AISurveillanceAnalyzer';
import FieldInspectionSim from './components/FieldInspectionSim';
import LegalNoticeModal from './components/LegalNoticeModal';
import ParcelsDetailModal from './components/ParcelsDetailModal';
import LeasesDetailModal from './components/LeasesDetailModal';
import EncroachmentDetailModal from './components/EncroachmentDetailModal';
import AuthModal from './components/AuthModal';

function SidebarWrapper() {
  const location = useLocation();
  if (location.pathname === '/login') return null;
  return <Sidebar />;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [leases, setLeases] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sessionScannedBoundaries, setSessionScannedBoundaries] = useState([]);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isFieldSimOpen, setIsFieldSimOpen] = useState(false);
  const [is3DPitOpen, setIs3DPitOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedAnomalyForPDF, setSelectedAnomalyForPDF] = useState(null);

  const [isParcelsModalOpen, setIsParcelsModalOpen] = useState(false);
  const [isLeasesModalOpen, setIsLeasesModalOpen] = useState(false);
  const [isEncroachmentModalOpen, setIsEncroachmentModalOpen] = useState(false);

  const fetchLayers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/gis/overview-layers`);
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

  return (
    <ThemeProvider>
      <LiveDataProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="flex h-screen w-full bg-slate-50 dark:bg-[#0B0F17] overflow-hidden font-sans text-slate-900 dark:text-slate-200">
              <SidebarWrapper />

          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            <Routes>
              <Route path="/" element={<ProtectedRoute><LandingPage /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin-panel" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
              
              <Route
                path="/2d-scanner"
                element={
                  <ProtectedRoute>
                    <BoundaryScanner
                      parcels={parcels}
                      leases={leases}
                      anomalies={anomalies}
                      sessionScannedBoundaries={sessionScannedBoundaries}
                      onScanSuccess={(newBoundary) => {
                        setSessionScannedBoundaries(prev => [...prev, newBoundary]);
                      }}
                      onSelectAnomaly={(anomaly) => setSelectedAnomalyForPDF(anomaly)}
                      onGeneratePDF={(id) => {
                        const item = anomalies.find(a => a._id === id) || anomalies[0];
                        setSelectedAnomalyForPDF(item);
                      }}
                      fetchLayers={fetchLayers}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/3d-mapping"
                element={<ProtectedRoute><DepthMapping /></ProtectedRoute>}
              />
              <Route
                path="/scanner-2d"
                element={
                  <ProtectedRoute>
                    <Scanner2D
                      onScanSuccess={(newBoundary) => {
                        setSessionScannedBoundaries(prev => [...prev, newBoundary]);
                      }}
                    />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>

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
            onRegisterSuccess={() => fetchLayers()}
          />

          <AISurveillanceAnalyzer
            isOpen={isAIOpen}
            onClose={() => setIsAIOpen(false)}
            leases={leases}
            onAnalysisComplete={() => fetchLayers()}
          />

          <FieldInspectionSim
            isOpen={isFieldSimOpen}
            onClose={() => setIsFieldSimOpen(false)}
            anomalies={anomalies}
            onInspectionSubmitted={() => fetchLayers()}
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
          />
        </div>
          </BrowserRouter>
        </AuthProvider>
      </LiveDataProvider>
    </ThemeProvider>
  );
}