import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Layers, Globe, Compass, AlertTriangle, Eye, Download, Check, Sparkles } from 'lucide-react';

const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid #FFFFFF;
        box-shadow: 0 0 12px ${color};
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const parcelIcon = createCustomIcon('#10B981');
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

function CoordinateTracker({ onUpdateCoords }) {
  useMapEvents({
    mousemove: (e) => {
      onUpdateCoords([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

export default function MapView({ parcels = [], leases = [], anomalies = [], onSelectAnomaly, onGeneratePDF }) {
  const [mapType, setMapType] = useState('satellite');

  const [showParcels, setShowParcels] = useState(true);
  const [showAnomalies, setShowAnomalies] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const [flyZoom, setFlyZoom] = useState(14);
  const [searchPin, setSearchPin] = useState(null);
  const [hoverCoords, setHoverCoords] = useState([10.9560, 77.9620]);

  const [selectedItem, setSelectedItem] = useState(null);

  const defaultLat = 10.9560;
  const defaultLng = 77.9620;

  const tileProviders = {
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles &copy; Esri"
    },
    hybrid: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      labelsUrl: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles &copy; Esri"
    },
    dark: {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: "&copy; CARTO"
    },
    streets: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "&copy; OSM"
    }
  };

  const handleSearch = async (query) => {
    if (!query || query.trim().length < 2) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setSearchResults(data || []);
    } catch (err) {
      console.error('Location Search Error:', err);
    } finally {
      setIsSearching(false);
    }
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

  const parcelStyle = { color: '#10B981', weight: 2.5, fillColor: '#10B981', fillOpacity: 0.25, dashArray: '4' };
  const anomalyStyle = { color: '#EF4444', weight: 3.5, fillColor: '#EF4444', fillOpacity: 0.55, className: 'animate-pulse-glow' };

  return (
    <div className="relative w-full h-full bg-[#0B0F17] rounded-[32px] border border-[#1E293B] overflow-hidden flex flex-col md:flex-row shadow-2xl">

      {/* TOP SEARCH & NAVIGATION */}
      <div className="absolute top-4 left-16 right-4 md:right-auto z-[1000] flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-3xl">
        <div className="relative flex-1 bg-[#131B2B]/95 backdrop-blur-md border border-[#1E293B] rounded-lg shadow-2xl p-1.5 flex items-center">
          <div className="pl-2 pr-1 text-[#0EA5E9]"><Search className="w-4 h-4" /></div>
          <input
            type="text"
            placeholder="Search ANY Location..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e.target.value); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(searchQuery); }}
            className="w-full bg-transparent text-xs text-white placeholder-[#94A3B8] focus:outline-none px-2 py-1.5 font-medium"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchPin(null); }} className="px-2 text-xs text-[#94A3B8] hover:text-white">✕</button>
          )}

          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#131B2B] border border-[#1E293B] rounded-lg shadow-2xl overflow-hidden z-[2000] max-h-60 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <div key={idx} onClick={() => handleSelectLocation(item)} className="p-2.5 hover:bg-[#0EA5E9]/20 border-b border-[#1E293B] last:border-0 cursor-pointer flex items-center gap-2 transition-all text-xs">
                  <MapPin className="w-4 h-4 text-[#0EA5E9] shrink-0" />
                  <div className="overflow-hidden">
                    <span className="font-bold text-white block truncate">{item.display_name.split(',')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#131B2B]/95 backdrop-blur-md border border-[#1E293B] rounded-lg p-1.5 shadow-2xl flex flex-wrap items-center gap-1.5 text-xs">
          <button onClick={() => setMapType('satellite')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${mapType === 'satellite' ? 'bg-[#0EA5E9] text-white shadow-md' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'}`}>🛰️ Real Satellite</button>
          <button onClick={() => setMapType('hybrid')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${mapType === 'hybrid' ? 'bg-[#0EA5E9] text-white shadow-md' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'}`}>🛰️ Hybrid + Labels</button>

          <div className="h-4 w-px bg-[#1E293B] mx-1 hidden sm:block"></div>

          <button onClick={() => { setFlyTarget([10.9560, 77.9620]); setFlyZoom(14); }} className="px-2 py-1 bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] rounded border border-[#10B981]/30 text-[10px] font-bold">📍 Karur</button>
          {/* NEW BUTTON TO SEE YOUR SCANNED AREA */}
          <button onClick={() => { setFlyTarget([11.0168, 76.9558]); setFlyZoom(16); }} className="px-2 py-1 bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] rounded border border-[#EF4444]/30 text-[10px] font-bold">📍 Coimbatore (Scan)</button>
        </div>
      </div>

      {/* GIS Layers Control */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-[#131B2B]/90 backdrop-blur-md border border-[#1E293B] rounded-lg p-3 shadow-xl flex flex-wrap items-center gap-3 text-xs">
        <span className="font-bold text-white flex items-center gap-1.5"><Layers className="w-4 h-4 text-[#0EA5E9]" /> GIS Overlays:</span>
        <label className="flex items-center gap-1.5 text-[#94A3B8] cursor-pointer hover:text-white">
          <input type="checkbox" checked={showParcels} onChange={(e) => setShowParcels(e.target.checked)} className="rounded accent-[#10B981]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span> Parcels ({parcels.length})
        </label>
        <label className="flex items-center gap-1.5 text-[#94A3B8] cursor-pointer hover:text-white">
          <input type="checkbox" checked={showAnomalies} onChange={(e) => setShowAnomalies(e.target.checked)} className="rounded accent-[#EF4444]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span> Scanned Boundaries ({anomalies.length})
        </label>

        <div className="font-mono text-[11px] text-[#0EA5E9] bg-[#0B0F17] px-2.5 py-1 rounded border border-[#1E293B] ml-auto">
          LAT: {hoverCoords[0].toFixed(5)} • LNG: {hoverCoords[1].toFixed(5)}
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="flex-1 h-full w-full relative">
        <MapContainer center={[defaultLat, defaultLng]} zoom={13} scrollWheelZoom={true} zoomControl={false} style={{ height: '100%', width: '100%' }}>
          <ZoomControl position="topright" />
          <MapFlyController targetLocation={flyTarget} targetZoom={flyZoom} />
          <CoordinateTracker onUpdateCoords={setHoverCoords} />

          <TileLayer url={tileProviders[mapType].url} attribution={tileProviders[mapType].attribution} maxZoom={19} />
          {mapType === 'hybrid' && tileProviders.hybrid.labelsUrl && <TileLayer url={tileProviders.hybrid.labelsUrl} maxZoom={19} />}

          {searchPin && (
            <Marker position={[searchPin.lat, searchPin.lng]} icon={searchMarkerIcon}>
              <Popup><div className="p-1 space-y-1 text-xs font-mono"><div className="font-bold text-[#F59E0B]">TARGET</div><div className="text-white">{searchPin.name}</div></div></Popup>
            </Marker>
          )}

          {/* GREEN DUMMY PARCELS LAYER */}
          {showParcels && parcels.map((parcel) => (
            <React.Fragment key={`parcel-${parcel._id}`}>
              {parcel.boundaryPolygon && <GeoJSON data={parcel.boundaryPolygon} style={parcelStyle} eventHandlers={{ click: () => setSelectedItem({ type: 'parcel', data: parcel }) }} />}
            </React.Fragment>
          ))}

          {/* RED SCANNED ANOMALIES LAYER (This was missing from your code!) */}
          {showAnomalies && anomalies.map((anomaly) => (
            <React.Fragment key={`anomaly-${anomaly._id}`}>
              {anomaly.infringingPolygon && (
                <GeoJSON
                  data={anomaly.infringingPolygon}
                  style={anomalyStyle}
                  eventHandlers={{ click: () => onSelectAnomaly && onSelectAnomaly(anomaly) }}
                />
              )}
            </React.Fragment>
          ))}

        </MapContainer>
      </div>
    </div>
  );
}