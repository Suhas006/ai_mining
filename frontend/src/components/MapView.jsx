import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Layers, Globe } from 'lucide-react';

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

function CoordinateTracker({ onUpdateCoords }) {
  useMapEvents({ mousemove: (e) => onUpdateCoords([e.latlng.lat, e.latlng.lng]) });
  return null;
}

function RightClickCoordinates() {
  useMapEvents({
    contextmenu: (e) => {
      const lat = e.latlng.lat.toFixed(5);
      const lng = e.latlng.lng.toFixed(5);
      const text = `${lat}, ${lng}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          alert(`Coordinates copied to clipboard:\nLat: ${lat}\nLng: ${lng}`);
        }).catch(err => {
          console.error('Could not copy text: ', err);
          alert(`Coordinates:\nLat: ${lat}\nLng: ${lng}`);
        });
      } else {
        alert(`Coordinates:\nLat: ${lat}\nLng: ${lng}`);
      }
    }
  });
  return null;
}

export default function MapView({ scannedBoundaries = [] }) {
  const [mapType, setMapType] = useState('satellite');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [flyTarget, setFlyTarget] = useState(null);
  const [flyZoom, setFlyZoom] = useState(14);
  const [searchPin, setSearchPin] = useState(null);
  const [hoverCoords, setHoverCoords] = useState([10.9560, 77.9620]);

  // Automatically fly to new scan results instantly
  useEffect(() => {
    if (scannedBoundaries && scannedBoundaries.length > 0) {
      const latest = scannedBoundaries[scannedBoundaries.length - 1];
      if (latest.location && latest.location.lat && latest.location.lng) {
        setFlyTarget([latest.location.lat, latest.location.lng]);
        setFlyZoom(18);
      }
    }
  }, [scannedBoundaries]);

  const defaultLat = 10.9560;
  const defaultLng = 77.9620;

  const tileProviders = {
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Esri"
    },
    hybrid: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      labelsUrl: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
      attribution: "Esri"
    },
    dark: {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: "CARTO"
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

  const anomalyStyle = { color: '#EF4444', weight: 3.5, fillColor: '#EF4444', fillOpacity: 0.55 };

  return (
    <div className="relative w-full h-full bg-[#0B0F17] rounded-[32px] border border-[#1E293B] overflow-hidden flex flex-col md:flex-row shadow-2xl">

      {/* TOP SEARCH & NAVIGATION BAR */}
      <div className="absolute top-4 left-16 right-4 z-[1000] flex flex-row items-start justify-between pointer-events-none">

        {/* Search Bar */}
        <div className="pointer-events-auto relative flex flex-col items-start justify-start">
          <div 
            className={`relative flex bg-[#131B2B]/95 backdrop-blur-md border border-[#1E293B] rounded-full shadow-2xl items-center transition-all duration-300 ease-in-out overflow-hidden ${
              isSearchExpanded ? 'w-64 p-2 h-12' : 'w-12 h-12 p-0 flex items-center justify-center cursor-pointer'
            }`}
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
              className={`bg-transparent text-xs text-white placeholder-[#94A3B8] focus:outline-none font-medium transition-all duration-300 ease-in-out ${
                isSearchExpanded ? 'w-full px-2 opacity-100' : 'w-0 opacity-0 px-0'
              }`}
              onBlur={(e) => {
                setTimeout(() => {
                  if (!searchQuery && searchResults.length === 0) {
                    setIsSearchExpanded(false);
                  }
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
                  <MapPin size={20} className="text-[#0EA5E9] shrink-0" />
                  <div className="overflow-hidden">
                    <span className="font-bold text-white block truncate">{item.display_name.split(',')[0]}</span>
                    <span className="text-[10px] text-[#94A3B8] block truncate">{item.display_name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map Toggles Toolbar */}
        <div className="pointer-events-auto bg-[#131B2B]/95 backdrop-blur-md border border-[#1E293B] rounded-full p-1.5 shadow-2xl flex items-center gap-2 text-xs">
          <button title="Satellite" onClick={() => setMapType('satellite')} className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${mapType === 'satellite' ? 'bg-[#0EA5E9] text-white shadow-md' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'}`}>
            <Globe size={18} />
          </button>
          <button title="Hybrid" onClick={() => setMapType('hybrid')} className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${mapType === 'hybrid' ? 'bg-[#0EA5E9] text-white shadow-md' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'}`}>
            <Layers size={18} />
          </button>
        </div>
      </div>

      {/* Coordinate Tracker Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-[#131B2B]/90 backdrop-blur-md border border-[#1E293B] rounded-lg p-3 shadow-xl text-xs text-[#0EA5E9] font-mono">
        LAT: {hoverCoords[0].toFixed(5)} • LNG: {hoverCoords[1].toFixed(5)}
      </div>

      {/* Map Canvas */}
      <div className="flex-1 h-full w-full relative">
        <MapContainer 
          center={[defaultLat, defaultLng]} 
          zoom={13} 
          minZoom={4} 
          maxZoom={22} 
          zoomControl={false} 
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={1.0}
          style={{ height: '100%', width: '100%' }}
        >
          <ZoomControl position="bottomright" />
          <MapFlyController targetLocation={flyTarget} targetZoom={flyZoom} />
          <CoordinateTracker onUpdateCoords={setHoverCoords} />
          <RightClickCoordinates />

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

          {/* RENDER SESSION SCANNED BOUNDARIES */}
          {scannedBoundaries.map((boundary, idx) => (
            boundary.boundary_polygon && (
              <GeoJSON
                key={`scan-boundary-${idx}`}
                data={{
                  type: "Feature",
                  geometry: {
                    type: "Polygon",
                    coordinates: [boundary.boundary_polygon.map(coord => [coord[1], coord[0]])]
                  }
                }}
                style={anomalyStyle}
              />
            )
          ))}
        </MapContainer>
      </div>
    </div>
  );
}