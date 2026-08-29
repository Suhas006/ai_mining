import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Layers, Globe, Compass, AlertTriangle, Eye, Download, Check, Sparkles } from 'lucide-react';

// Custom Marker Icons for Leaflet
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

const alertIcon = createCustomIcon('#EF4444');
const parcelIcon = createCustomIcon('#10B981');
const searchMarkerIcon = createCustomIcon('#F59E0B');

// Leaflet Helper Component to smoothly fly to any searched location
function MapFlyController({ targetLocation, targetZoom }) {
  const map = useMap();
  useEffect(() => {
    if (targetLocation) {
      map.flyTo(targetLocation, targetZoom || 15, {
        duration: 2.5,
        easeLinearity: 0.25
      });
    }
  }, [targetLocation, targetZoom, map]);
  return null;
}

// Leaflet Helper Component to track cursor coordinates
function CoordinateTracker({ onUpdateCoords }) {
  useMapEvents({
    mousemove: (e) => {
      onUpdateCoords([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

export default function MapView({ parcels = [], leases = [], anomalies = [], onSelectAnomaly, onGeneratePDF }) {
  // Tile Base Map Choice: 'satellite' | 'hybrid' | 'dark' | 'streets'
  const [mapType, setMapType] = useState('satellite');
  
  // Layer visibility toggles
  const [showParcels, setShowParcels] = useState(true);
  const [showLeases, setShowLeases] = useState(true);
  const [showAnomalies, setShowAnomalies] = useState(true);

  // Search Bar State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const [flyZoom, setFlyZoom] = useState(14);
  const [searchPin, setSearchPin] = useState(null);
  const [hoverCoords, setHoverCoords] = useState([10.9560, 77.9620]);

  const [selectedItem, setSelectedItem] = useState(null);

  // Default Initial Center (Karur Granite Belt, Tamil Nadu)
  const defaultLat = 10.9560;
  const defaultLng = 77.9620;

  // Real Satellite Tile Layers URLs
  const tileProviders = {
    // High-Resolution ESRI Real World Satellite (Google Maps style real satellite imagery)
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
    },
    // Real Satellite + Transportation Labels Overlay
    hybrid: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      labelsUrl: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles &copy; Esri World Imagery & Transportation"
    },
    // Dark Command GIS
    dark: {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: "&copy; CARTO &copy; OpenStreetMap contributors"
    },
    // Standard OpenStreetMap
    streets: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "&copy; OpenStreetMap contributors"
    }
  };

  // Perform Live Location Search via OpenStreetMap Nominatim Geocoding
  const handleSearch = async (query) => {
    if (!query || query.trim().length < 2) return;
    setIsSearching(true);
    try {
      // Search with bias towards India / worldwide location
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
    setSearchPin({
      lat,
      lng,
      name: result.display_name
    });
    setSearchResults([]);
    setSearchQuery(result.display_name.split(',')[0]);
  };

  // Styles for GeoJSON Features
  const parcelStyle = {
    color: '#10B981',
    weight: 2.5,
    fillColor: '#10B981',
    fillOpacity: 0.25,
    dashArray: '4'
  };

  const leaseStyle = {
    color: '#0EA5E9',
    weight: 3,
    fillColor: '#0EA5E9',
    fillOpacity: 0.3
  };

  const anomalyStyle = {
    color: '#EF4444',
    weight: 3.5,
    fillColor: '#EF4444',
    fillOpacity: 0.55,
    className: 'animate-pulse-glow'
  };

  return (
    <div className="relative w-full h-full bg-[#0B0F17] rounded-[32px] border border-[#1E293B] overflow-hidden flex flex-col md:flex-row shadow-2xl">
      
      {/* TOP SEARCH & NAVIGATION BAR OVERLAY */}
      <div className="absolute top-4 left-16 right-4 md:right-auto z-[1000] flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-3xl">
        
        {/* Real-Time Location Search Box */}
        <div className="relative flex-1 bg-[#131B2B]/95 backdrop-blur-md border border-[#1E293B] rounded-lg shadow-2xl p-1.5 flex items-center">
          <div className="pl-2 pr-1 text-[#0EA5E9]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search ANY Location in India or World (e.g. Karur, Salem, Chennai, Delhi)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch(searchQuery);
            }}
            className="w-full bg-transparent text-xs text-white placeholder-[#94A3B8] focus:outline-none px-2 py-1.5 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
                setSearchPin(null);
              }}
              className="px-2 text-xs text-[#94A3B8] hover:text-white"
            >
              ✕
            </button>
          )}

          {/* Location Autocomplete Dropdown List */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#131B2B] border border-[#1E293B] rounded-lg shadow-2xl overflow-hidden z-[2000] max-h-60 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectLocation(item)}
                  className="p-2.5 hover:bg-[#0EA5E9]/20 border-b border-[#1E293B] last:border-0 cursor-pointer flex items-center gap-2 transition-all text-xs"
                >
                  <MapPin className="w-4 h-4 text-[#0EA5E9] shrink-0" />
                  <div className="overflow-hidden">
                    <span className="font-bold text-white block truncate">{item.display_name.split(',')[0]}</span>
                    <span className="text-[10px] text-[#94A3B8] block truncate">{item.display_name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real Satellite Base Layer Switcher & Pan-India Quick Presets */}
        <div className="bg-[#131B2B]/95 backdrop-blur-md border border-[#1E293B] rounded-lg p-1.5 shadow-2xl flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setMapType('satellite')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
              mapType === 'satellite'
                ? 'bg-[#0EA5E9] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            🛰️ Real Satellite
          </button>

          <button
            onClick={() => setMapType('hybrid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
              mapType === 'hybrid'
                ? 'bg-[#0EA5E9] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
            }`}
          >
            🛰️ Hybrid + Labels
          </button>

          <button
            onClick={() => setMapType('dark')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
              mapType === 'dark'
                ? 'bg-[#0EA5E9] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
            }`}
          >
            🌙 Dark GIS
          </button>

          <div className="h-4 w-px bg-[#1E293B] mx-1 hidden sm:block"></div>

          {/* Quick Fly District Presets */}
          <span className="text-[10px] text-[#94A3B8] font-bold uppercase hidden lg:inline">Fly to District:</span>
          
          <button
            onClick={() => { setFlyTarget([10.9560, 77.9620]); setFlyZoom(14); }}
            className="px-2 py-1 bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] rounded border border-[#10B981]/30 text-[10px] font-bold"
          >
            📍 Karur
          </button>

          <button
            onClick={() => { setFlyTarget([9.9252, 78.1198]); setFlyZoom(13); }}
            className="px-2 py-1 bg-[#131B2B] hover:bg-[#1E293B] text-white rounded border border-[#1E293B] text-[10px] font-bold"
          >
            📍 Madurai
          </button>

          <button
            onClick={() => { setFlyTarget([11.6643, 78.1460]); setFlyZoom(13); }}
            className="px-2 py-1 bg-[#131B2B] hover:bg-[#1E293B] text-white rounded border border-[#1E293B] text-[10px] font-bold"
          >
            📍 Salem
          </button>

          <button
            onClick={() => { setFlyTarget([12.7409, 77.8253]); setFlyZoom(13); }}
            className="px-2 py-1 bg-[#131B2B] hover:bg-[#1E293B] text-white rounded border border-[#1E293B] text-[10px] font-bold"
          >
            📍 Hosur
          </button>

          <button
            onClick={() => { setFlyTarget([13.0827, 80.2707]); setFlyZoom(12); }}
            className="px-2 py-1 bg-[#131B2B] hover:bg-[#1E293B] text-white rounded border border-[#1E293B] text-[10px] font-bold"
          >
            📍 Chennai
          </button>

          <button
            onClick={() => { setFlyTarget([11.0168, 76.9558]); setFlyZoom(13); }}
            className="px-2 py-1 bg-[#131B2B] hover:bg-[#1E293B] text-white rounded border border-[#1E293B] text-[10px] font-bold"
          >
            📍 Coimbatore
          </button>

          <button
            onClick={() => { setFlyTarget([28.6139, 77.2090]); setFlyZoom(11); }}
            className="px-2 py-1 bg-[#131B2B] hover:bg-[#1E293B] text-[#0EA5E9] rounded border border-[#0EA5E9]/30 text-[10px] font-bold"
          >
            🇮🇳 New Delhi
          </button>
        </div>
      </div>

      {/* GIS Layers Control & Cursor Coords Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-[#131B2B]/90 backdrop-blur-md border border-[#1E293B] rounded-lg p-3 shadow-xl flex flex-wrap items-center gap-3 text-xs">
        <span className="font-bold text-white flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#0EA5E9]" />
          GIS Overlays:
        </span>
        
        <label className="flex items-center gap-1.5 text-[#94A3B8] cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={showParcels}
            onChange={(e) => setShowParcels(e.target.checked)}
            className="rounded accent-[#10B981]"
          />
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
          Parcels ({parcels.length})
        </label>



        {/* Live Hover Coords Display */}
        <div className="font-mono text-[11px] text-[#0EA5E9] bg-[#0B0F17] px-2.5 py-1 rounded border border-[#1E293B] ml-auto">
          LAT: {hoverCoords[0].toFixed(5)} • LNG: {hoverCoords[1].toFixed(5)}
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="flex-1 h-full w-full relative">
        <MapContainer
          center={[defaultLat, defaultLng]}
          zoom={13}
          scrollWheelZoom={true}
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <ZoomControl position="topright" />
          {/* Smooth Fly-To Controller */}
          <MapFlyController targetLocation={flyTarget} targetZoom={flyZoom} />

          {/* Mouse Coordinate Tracker */}
          <CoordinateTracker onUpdateCoords={setHoverCoords} />

          {/* Base Satellite Tile Layer */}
          <TileLayer
            url={tileProviders[mapType].url}
            attribution={tileProviders[mapType].attribution}
            maxZoom={19}
          />

          {/* Optional Transportation Labels Overlay for Hybrid mode */}
          {mapType === 'hybrid' && tileProviders.hybrid.labelsUrl && (
            <TileLayer
              url={tileProviders.hybrid.labelsUrl}
              maxZoom={19}
            />
          )}

          {/* Searched Target Location Marker */}
          {searchPin && (
            <Marker position={[searchPin.lat, searchPin.lng]} icon={searchMarkerIcon}>
              <Popup>
                <div className="p-1 space-y-1 text-xs font-mono">
                  <div className="font-bold text-[#F59E0B]">SEARCHED TARGET LOCATION</div>
                  <div className="text-white">{searchPin.name}</div>
                  <div className="text-[#94A3B8]">[{searchPin.lat.toFixed(5)}, {searchPin.lng.toFixed(5)}]</div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Land Parcels GeoJSON Layer */}
          {showParcels && parcels.map((parcel) => (
            <React.Fragment key={`parcel-${parcel._id}`}>
              {parcel.boundaryPolygon && (
                <GeoJSON
                  data={parcel.boundaryPolygon}
                  style={parcelStyle}
                  eventHandlers={{
                    click: () => setSelectedItem({ type: 'parcel', data: parcel })
                  }}
                />
              )}
              {parcel.centroid && (
                <Marker
                  position={[parcel.centroid.coordinates[1], parcel.centroid.coordinates[0]]}
                  icon={parcelIcon}
                >
                  <Popup>
                    <div className="p-1 space-y-1 text-xs">
                      <div className="font-bold text-[#10B981]">LAND PARCEL (ULPIN)</div>
                      <div className="font-mono text-white text-[11px] bg-[#0B0F17] p-1 rounded">
                        ULPIN: {parcel.ulpin}
                      </div>
                      <div>Owner: {parcel.ownerName}</div>
                      <div>Survey: {parcel.surveyNumber}</div>
                      <div>Area: {parcel.areaAcres} Acres</div>
                    </div>
                  </Popup>
                </Marker>
              )}
            </React.Fragment>
          ))}


        </MapContainer>
      </div>

    </div>
  );
}
