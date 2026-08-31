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
      map.flyTo(targetLocation, targetZoom || 16, { duration: 2.5, easeLinearity: 0.25 });
    }
  }, [targetLocation, targetZoom, map]);
  return null;
}

function CoordinateTracker({ onUpdateCoords }) {
  useMapEvents({ mousemove: (e) => onUpdateCoords([e.latlng.lat, e.latlng.lng]) });
  return null;
}

export default function MapView({ parcels = [], leases = [], anomalies = [], scannedBoundaries = [], onSelectAnomaly }) {
  const [mapType, setMapType] = useState('satellite');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [flyTarget, setFlyTarget] = useState(null);
  const [flyZoom, setFlyZoom] = useState(14);
  const [searchPin, setSearchPin] = useState(null);
  const [hoverCoords, setHoverCoords] = useState([10.9560, 77.9620]);

  // 🌟 Automatically fly and zoom into the scanned boundary location instantly
  useEffect(() => {
    if (scannedBoundaries && scannedBoundaries.length > 0) {
      const latest = scannedBoundaries[scannedBoundaries.length - 1];
      if (latest.location && latest.location.lat && latest.location.lng) {
        setFlyTarget([latest.location.lat, latest.location.lng]);
        setFlyZoom(18); // Close zoom level to view property lines clearly
      }
    }
  }, [scannedBoundaries]);

  const defaultLat = 10.9560;
  const defaultLng = 77.9620;

  const tileProviders = {
    satellite: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attribution: "Esri" },
    hybrid: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", labelsUrl: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}", attribution: "Esri" },
    dark: { url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", attribution: "CARTO" }
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

  const parcelStyle = { color: '#10B981', weight: 2.5, fillColor: '#10B981', fillOpacity: 0.25, dashArray: '4' };
  const anomalyStyle = { color: '#EF4444', weight: 3.5, fillColor: '#EF4444', fillOpacity: 0.55 };

  return (
    <div className="relative w-full h-full bg-[#0B0F17] rounded-[32px] border border-[#1E293B] overflow-hidden flex flex-col md:flex-row shadow-2xl">
      <div className="absolute top-4 left-16 right-4 md:right-auto z-[1000] flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-3xl">
        <div className="relative flex-1 bg-[#131B2B]/95 backdrop-blur-md border border-[#1E293B] rounded-lg shadow-2xl p-1.5 flex items-center">
          <Search className="w-4 h-4 text-[#0EA5E9] ml-2" />
          <input
            type="text"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e.target.value); }}
            className="w-full bg-transparent text-xs text-white placeholder-[#94A3B8] focus:outline-none px-2 py-1.5 font-medium"
          />
        </div>
        <div className="bg-[#131B2B]/95 backdrop-blur-md border border-[#1E293B] rounded-lg p-1.5 shadow-2xl flex items-center gap-1.5 text-xs">
          <button onClick={() => setMapType('satellite')} className="px-3 py-1.5 rounded text-xs font-bold bg-[#0EA5E9] text-white">Satellite</button>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-[1000] bg-[#131B2B]/90 backdrop-blur-md border border-[#1E293B] rounded-lg p-3 shadow-xl text-xs text-[#0EA5E9] font-mono">
        LAT: {hoverCoords[0].toFixed(5)} • LNG: {hoverCoords[1].toFixed(5)}
      </div>

      <div className="flex-1 h-full w-full relative">
        <MapContainer center={[defaultLat, defaultLng]} zoom={13} zoomControl={false} style={{ height: '100%', width: '100%' }}>
          <ZoomControl position="topright" />
          <MapFlyController targetLocation={flyTarget} targetZoom={flyZoom} />
          <CoordinateTracker onUpdateCoords={setHoverCoords} />

          <TileLayer url={tileProviders[mapType].url} attribution={tileProviders[mapType].attribution} maxZoom={19} />
          {mapType === 'hybrid' && <TileLayer url={tileProviders.hybrid.labelsUrl} maxZoom={19} />}

          {searchPin && (
            <Marker position={[searchPin.lat, searchPin.lng]} icon={searchMarkerIcon}>
              <Popup><div className="text-xs">{searchPin.name}</div></Popup>
            </Marker>
          )}

          {/* Render standard GIS parcels */}
          {parcels.map((parcel) => (
            parcel.boundaryPolygon && (
              <GeoJSON key={`parcel-${parcel._id}`} data={parcel.boundaryPolygon} style={parcelStyle} />
            )
          ))}

          {/* Render database anomalies */}
          {anomalies.map((anomaly) => (
            anomaly.infringingPolygon && (
              <GeoJSON key={`anomaly-${anomaly._id}`} data={anomaly.infringingPolygon} style={anomalyStyle} />
            )
          ))}

          {/* 🌟 RENDER SESSION SCANNED BOUNDARIES DYNAMICALLY */}
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