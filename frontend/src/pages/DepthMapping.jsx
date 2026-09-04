import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap, ZoomControl, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Cuboid, ArrowDownToLine, ArrowUpToLine, MapPin, Activity, Map as MapIcon, Search, Layers, Globe } from 'lucide-react';

const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #FFFFFF; box-shadow: 0 0 12px ${color};"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const searchMarkerIcon = createCustomIcon('#F59E0B');

function MapFlyController({ targetLocation, targetZoom }) {
  const map = useMap();
  useEffect(() => {
    if (targetLocation) {
      map.flyTo(targetLocation, targetZoom || 15, { duration: 2.5, easeLinearity: 0.25 });
    }
  }, [targetLocation, targetZoom, map]);
  return null;
}

const DepthMapping = () => {
  const [baseLat, setBaseLat] = useState('');
  const [baseLng, setBaseLng] = useState('');
  const [targetLat, setTargetLat] = useState('');
  const [targetLng, setTargetLng] = useState('');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activePicker, setActivePicker] = useState(null);

  const [mapType, setMapType] = useState('satellite');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [flyTarget, setFlyTarget] = useState(null);
  const [flyZoom, setFlyZoom] = useState(14);
  const [searchPin, setSearchPin] = useState(null);

  const tileProviders = {
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; Esri'
    },
    hybrid: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      labelsUrl: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; Esri'
    }
  };

  const handleSearch = async (query) => {
    if (!query || query.trim().length < 2) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setSearchResults(data || []);
    } catch (err) { }
  };

  const handleSelectLocation = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setFlyTarget([lat, lng]);
    setFlyZoom(15);
    setSearchPin({ lat, lng, name: result.display_name });
    setSearchResults([]);
    setSearchQuery(result.display_name.split(',')[0]);
  };

  const LocationPicker = () => {
    useMapEvents({
      contextmenu(e) {
        if (activePicker === 'ground') {
          setBaseLat(e.latlng.lat.toFixed(6));
          setBaseLng(e.latlng.lng.toFixed(6));
        } else if (activePicker === 'target') {
          setTargetLat(e.latlng.lat.toFixed(6));
          setTargetLng(e.latlng.lng.toFixed(6));
        }
        setActivePicker(null);
      },
      click(e) {
        if (activePicker === 'ground') {
          setBaseLat(e.latlng.lat.toFixed(6));
          setBaseLng(e.latlng.lng.toFixed(6));
        } else if (activePicker === 'target') {
          setTargetLat(e.latlng.lat.toFixed(6));
          setTargetLng(e.latlng.lng.toFixed(6));
        }
        setActivePicker(null);
      }
    });
    return null;
  };

  const fetchRealElevation = async (latitude, longitude) => {
    try {
      // 🚨 FIX: Replaced hardcoded URL with dynamic environment variable / custom URL 🚨
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'YOUR_BACKEND_URL_HERE';

      const response = await fetch(`${backendUrl}/api/elevation?lat=${latitude}&lng=${longitude}`);

      if (!response.ok) throw new Error(`Backend returned status: ${response.status}`);
      const data = await response.json();

      if (data && data.results && data.results.length > 0) {
        return {
          elevation: data.results[0].elevation,
          dataSource: data.dataSource || "ESA Copernicus (LiDAR/Radar)"
        };
      }
      return null;
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  };

  const handleFetch = async () => {
    if (!baseLat || !baseLng || !targetLat || !targetLng) {
      alert("Please enter both Reference and Target coordinates.");
      return;
    }
    setLoading(true);

    try {
      const baseData = await fetchRealElevation(baseLat, baseLng);
      const targetData = await fetchRealElevation(targetLat, targetLng);

      if (baseData !== null && targetData !== null) {
        const zDifference = baseData.elevation - targetData.elevation;
        const isDig = zDifference >= 0;
        const exactZAxis = Math.abs(zDifference).toFixed(2);

        const finalDataSource = (baseData.dataSource.includes('Fallback') || targetData.dataSource.includes('Fallback'))
          ? "⚠️ Smart Fallback (API Timeout)"
          : targetData.dataSource;

        setResults({
          baseElev: baseData.elevation.toFixed(2),
          targetElev: targetData.elevation.toFixed(2),
          exactZAxis: exactZAxis,
          type: isDig ? 'Excavation (Depth)' : 'Structure (Height)',
          dataSource: finalDataSource
        });
      } else {
        alert("Failed to fetch satellite data. Check your backend connection.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-full p-4 gap-4 bg-[#0B0F17]">
      <div className="flex-[4] h-full rounded-xl overflow-hidden shadow-2xl border border-[#1E293B] relative bg-[#0F172A] flex flex-col items-center justify-center">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#38BDF8 1px, transparent 1px), linear-gradient(90deg, #38BDF8 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            transform: 'perspective(1000px) rotateX(60deg) translateY(-100px) translateZ(-200px) scale(3)',
            transformOrigin: 'top center'
          }}
        />

        {!activePicker && !results && !loading && (
          <div className="z-10 text-center animate-pulse">
            <Cuboid className="w-20 h-20 text-[#1E293B] mx-auto mb-4" />
            <p className="text-[#475569] font-medium tracking-widest uppercase text-sm">Awaiting Baseline & Target GPS Coordinates</p>
          </div>
        )}

        {!activePicker && loading && (
          <div className="z-10 text-center">
            <div className="w-16 h-16 border-4 border-[#0EA5E9]/20 border-t-[#0EA5E9] rounded-full animate-spin mx-auto mb-4 shadow-[0_0_20px_rgba(14,165,233,0.5)]" />
            <p className="text-[#0EA5E9] font-mono text-xs">CALCULATING Z-AXIS DELTA FROM ESA SATELLITES...</p>
          </div>
        )}

        {!activePicker && results && !loading && (
          <div className="z-10 w-full h-full flex flex-col items-center justify-center relative">
            <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">

              {results.type.includes('Height') ? (
                <div className="flex flex-col items-center">
                  <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/50 px-6 py-3 rounded-xl backdrop-blur-md flex flex-col items-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                    <span className="text-[10px] uppercase tracking-widest text-[#F59E0B]">Target (Peak/Roof)</span>
                    <span className="font-mono font-bold text-2xl text-white">{results.targetElev}m</span>
                  </div>

                  <div className="h-40 w-1 bg-gradient-to-b from-[#F59E0B] to-[#10B981] relative my-2 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                    <div className="absolute bg-[#0B0F17] border border-[#F59E0B]/50 px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap shadow-xl">
                      <ArrowUpToLine className="w-5 h-5 text-[#F59E0B] animate-bounce" />
                      <span className="font-mono font-bold text-[#F59E0B]">+{results.exactZAxis}m Delta</span>
                    </div>
                  </div>

                  <div className="bg-[#10B981]/10 border border-[#10B981]/50 px-6 py-3 rounded-xl backdrop-blur-md flex flex-col items-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <span className="text-[10px] uppercase tracking-widest text-[#10B981]">Reference Ground</span>
                    <span className="font-mono font-bold text-2xl text-white">{results.baseElev}m</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="bg-[#10B981]/10 border border-[#10B981]/50 px-6 py-3 rounded-xl backdrop-blur-md flex flex-col items-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <span className="text-[10px] uppercase tracking-widest text-[#10B981]">Reference Ground</span>
                    <span className="font-mono font-bold text-2xl text-white">{results.baseElev}m</span>
                  </div>

                  <div className="h-40 w-1 bg-gradient-to-b from-[#10B981] to-[#38BDF8] relative my-2 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                    <div className="absolute bg-[#0B0F17] border border-[#38BDF8]/50 px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap shadow-xl">
                      <ArrowDownToLine className="w-5 h-5 text-[#38BDF8] animate-bounce" />
                      <span className="font-mono font-bold text-[#38BDF8]">- {results.exactZAxis}m Delta</span>
                    </div>
                  </div>

                  <div className="bg-[#38BDF8]/10 border border-[#38BDF8]/50 px-6 py-3 rounded-xl backdrop-blur-md flex flex-col items-center shadow-[0_0_30px_rgba(56,189,248,0.2)]">
                    <span className="text-[10px] uppercase tracking-widest text-[#38BDF8]">Target (Pit/Valley)</span>
                    <span className="font-mono font-bold text-2xl text-white">{results.targetElev}m</span>
                  </div>
                </div>
              )}

            </div>

            <div className="absolute bottom-8 left-8 bg-[#131B2B]/90 backdrop-blur border border-[#1E293B] p-4 rounded-lg shadow-2xl">
              <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#0EA5E9]" />
                Target Telemetry
              </div>
              <div className="font-mono text-white text-sm">LAT: {targetLat}</div>
              <div className="font-mono text-white text-sm">LNG: {targetLng}</div>
            </div>
          </div>
        )}

        {activePicker && (
          <div className="relative w-full h-full rounded-xl overflow-hidden z-50">
            <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-between pointer-events-none">
              <div className="pointer-events-auto relative flex flex-col items-start justify-start">
                <div
                  className={`relative flex bg-[#131B2B]/95 backdrop-blur-md border border-[#1E293B] rounded-full shadow-2xl items-center transition-all duration-300 ease-in-out overflow-hidden ${isSearchExpanded ? 'w-64 p-2 h-12' : 'w-12 h-12 p-0 flex items-center justify-center cursor-pointer'}`}
                  onClick={() => { if (!isSearchExpanded) setIsSearchExpanded(true); }}
                >
                  <div
                    className={`text-[#0EA5E9] flex items-center justify-center transition-all ${isSearchExpanded ? 'pl-2 pr-1' : 'w-full h-full rounded-full flex items-center justify-center hover:bg-[#1E293B]'}`}
                    onClick={(e) => {
                      if (isSearchExpanded) {
                        e.stopPropagation();
                        if (!searchQuery) setIsSearchExpanded(false);
                      }
                    }}
                  >
                    <Search size={18} className="w-5 h-5" />
                  </div>

                  <input
                    type="text"
                    placeholder="Search ANY Location..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e.target.value); }}
                    className={`bg-transparent text-xs text-white placeholder-[#94A3B8] focus:outline-none font-medium transition-all duration-300 ease-in-out ${isSearchExpanded ? 'w-full px-2 opacity-100' : 'w-0 opacity-0 px-0'}`}
                    onBlur={(e) => {
                      setTimeout(() => {
                        if (!searchQuery && searchResults.length === 0) setIsSearchExpanded(false);
                      }, 200);
                    }}
                  />
                  {searchQuery && isSearchExpanded && (
                    <button onClick={(e) => { e.stopPropagation(); setSearchQuery(''); setSearchResults([]); setSearchPin(null); }} className="px-3 text-xs text-[#94A3B8] hover:text-white flex items-center justify-center h-full">✕</button>
                  )}
                </div>

                {searchResults.length > 0 && isSearchExpanded && (
                  <div className="absolute top-full left-0 w-64 mt-2 bg-[#131B2B] border border-[#1E293B] rounded-lg shadow-2xl overflow-hidden z-[2000] max-h-60 overflow-y-auto">
                    {searchResults.map((item, idx) => (
                      <div key={idx} onClick={() => handleSelectLocation(item)} className="p-2.5 hover:bg-[#0EA5E9]/20 border-b border-[#1E293B] last:border-0 cursor-pointer flex items-center gap-2 transition-all text-xs">
                        <MapPin size={16} className="text-[#0EA5E9] shrink-0" />
                        <div className="overflow-hidden">
                          <span className="font-bold text-white block truncate">{item.display_name.split(',')[0]}</span>
                          <span className="text-[10px] text-[#94A3B8] block truncate">{item.display_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pointer-events-auto bg-[#131B2B]/95 backdrop-blur-md border border-[#1E293B] rounded-full p-1.5 shadow-2xl flex items-center gap-2 text-xs">
                <button title="Satellite" onClick={() => setMapType('satellite')} className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${mapType === 'satellite' ? 'bg-[#0EA5E9] text-white shadow-md' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'}`}>
                  <Globe size={18} />
                </button>
                <button title="Hybrid" onClick={() => setMapType('hybrid')} className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${mapType === 'hybrid' ? 'bg-[#0EA5E9] text-white shadow-md' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'}`}>
                  <Layers size={18} />
                </button>
              </div>
            </div>

            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] bg-[#131B2B]/90 backdrop-blur border border-[#1E293B] text-white px-4 py-2 rounded-lg shadow-2xl text-sm font-bold flex items-center gap-2 pointer-events-none">
              <MapPin className="w-4 h-4 text-[#0EA5E9]" />
              {activePicker === 'ground' ? 'Right-click or Tap map for Reference Ground' : 'Right-click or Tap map for Target'}
            </div>

            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              minZoom={3}
              maxZoom={22}
              zoomControl={false}
              maxBounds={[[-90, -180], [90, 180]]}
              maxBoundsViscosity={1.0}
              style={{ height: '100%', width: '100%' }}
            >
              <ZoomControl position="bottomright" />
              <MapFlyController targetLocation={flyTarget} targetZoom={flyZoom} />

              <TileLayer
                url={tileProviders[mapType].url}
                attribution={tileProviders[mapType].attribution}
                maxNativeZoom={18}
                maxZoom={22}
              />
              {mapType === 'hybrid' && tileProviders.hybrid.labelsUrl && (
                <TileLayer
                  url={tileProviders.hybrid.labelsUrl}
                  maxNativeZoom={18}
                  maxZoom={22}
                />
              )}

              {searchPin && (
                <Marker position={[searchPin.lat, searchPin.lng]} icon={searchMarkerIcon}>
                  <Popup><div className="text-xs font-mono"><div className="font-bold text-[#F59E0B]">SEARCH PIN</div><div className="text-white">{searchPin.name}</div></div></Popup>
                </Marker>
              )}
              <LocationPicker />
            </MapContainer>
          </div>
        )}
      </div>

      <div className="flex-[1] h-full bg-[#131B2B] rounded-xl border border-[#1E293B] shadow-2xl p-5 flex flex-col overflow-y-auto">
        <h2 className="text-white font-bold text-lg mb-1">Delta Z-Axis Scanner</h2>
        <p className="text-xs text-[#94A3B8] mb-6">Calculates exact physical depth or height using differential satellite telemetry.</p>

        <div className="mb-4 pb-4 border-b border-white/5">
          <label className="flex justify-between items-center text-xs font-bold text-[#10B981] uppercase tracking-wider mb-2">
            <span>1. Reference Ground (Baseline)</span>
            <button
              onClick={() => setActivePicker(activePicker === 'ground' ? null : 'ground')}
              className={`p-1.5 rounded-md transition-colors ${activePicker === 'ground' ? 'bg-[#10B981] text-white' : 'hover:bg-white/10'}`}
              title="Pick on map"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </label>
          <input
            type="number"
            placeholder="Ground Lat (e.g. 11.0168)"
            value={baseLat}
            onChange={(e) => setBaseLat(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#1E293B] text-white text-sm rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-[#10B981] font-mono"
          />
          <input
            type="number"
            placeholder="Ground Lng (e.g. 76.9558)"
            value={baseLng}
            onChange={(e) => setBaseLng(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#1E293B] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#10B981] font-mono"
          />
        </div>

        <div className="mb-4">
          <label className="flex justify-between items-center text-xs font-bold text-[#38BDF8] uppercase tracking-wider mb-2">
            <span>2. Target (Pit / Building)</span>
            <button
              onClick={() => setActivePicker(activePicker === 'target' ? null : 'target')}
              className={`p-1.5 rounded-md transition-colors ${activePicker === 'target' ? 'bg-[#38BDF8] text-white' : 'hover:bg-white/10'}`}
              title="Pick on map"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </label>
          <input
            type="number"
            placeholder="Target Lat (e.g. 11.0169)"
            value={targetLat}
            onChange={(e) => setTargetLat(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#1E293B] text-white text-sm rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-[#38BDF8] font-mono"
          />
          <input
            type="number"
            placeholder="Target Lng (e.g. 76.9559)"
            value={targetLng}
            onChange={(e) => setTargetLng(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#1E293B] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#38BDF8] font-mono"
          />
        </div>

        <button
          onClick={handleFetch}
          disabled={!baseLat || !baseLng || !targetLat || !targetLng || loading}
          className="w-full bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:from-[#38BDF8] hover:to-[#0EA5E9] disabled:opacity-50 text-white text-sm font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-6"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Activity className="w-4 h-4" />}
          {loading ? 'Calculating...' : 'Calculate Exact Z-Axis'}
        </button>

        {results && (
          <div className="mt-2 mb-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
                Verified {results.type}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs pb-1 border-b border-white/10">
                  <span className="text-[#94A3B8]">Reference Ground Elev:</span>
                  <span className="text-[#10B981] font-mono">{results.baseElev}m</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-1 border-b border-white/10">
                  <span className="text-[#94A3B8]">Target Point Elev:</span>
                  <span className="text-white font-mono">{results.targetElev}m</span>
                </div>

                <div className="flex flex-col gap-1 pt-2">
                  <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Calculated Exact Z-Axis</span>
                  <span className={`font-bold font-mono text-2xl ${results.type.includes('Depth') ? 'text-[#38BDF8]' : 'text-[#F59E0B]'}`}>
                    {results.exactZAxis} Meters
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-white/10 mt-2">
                  <span className="text-[#94A3B8]">Data Source:</span>
                  <span className={`font-mono px-2 py-1 rounded text-[10px] ${results.dataSource.includes('Fallback') ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'bg-white/10 text-white'}`}>
                    {results.dataSource}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepthMapping;