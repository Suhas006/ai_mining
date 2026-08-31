import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Layers, Globe } from 'lucide-react';

function MapFlyController({ targetLocation, targetZoom }) {
  const map = useMap();
  useEffect(() => {
    if (targetLocation) {
      map.flyTo(targetLocation, targetZoom || 18, { duration: 2.5, easeLinearity: 0.25 });
    }
  }, [targetLocation, targetZoom, map]);
  return null;
}

function CoordinateTracker({ onUpdateCoords }) {
  useMapEvents({ mousemove: (e) => onUpdateCoords([e.latlng.lat, e.latlng.lng]) });
  return null;
}

export default function MapView({ scannedBoundaries = [] }) {
  const [mapType, setMapType] = useState('satellite');
  const [flyTarget, setFlyTarget] = useState(null);
  const [flyZoom, setFlyZoom] = useState(14);
  const [hoverCoords, setHoverCoords] = useState([10.9560, 77.9620]);

  // Automatically fly and zoom into the newly scanned boundary location instantly
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
    satellite: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attribution: "Esri" }
  };

  const anomalyStyle = { color: '#EF4444', weight: 3.5, fillColor: '#EF4444', fillOpacity: 0.55 };

  return (
    <div className="relative w-full h-full bg-[#0B0F17] rounded-[32px] border border-[#1E293B] overflow-hidden flex flex-col md:flex-row shadow-2xl">
      <div className="absolute bottom-4 left-4 z-[1000] bg-[#131B2B]/90 backdrop-blur-md border border-[#1E293B] rounded-lg p-3 shadow-xl text-xs text-[#0EA5E9] font-mono">
        LAT: {hoverCoords[0].toFixed(5)} • LNG: {hoverCoords[1].toFixed(5)}
      </div>

      <div className="flex-1 h-full w-full relative">
        <MapContainer center={[defaultLat, defaultLng]} zoom={13} zoomControl={false} style={{ height: '100%', width: '100%' }}>
          <ZoomControl position="topright" />
          <MapFlyController targetLocation={flyTarget} targetZoom={flyZoom} />
          <CoordinateTracker onUpdateCoords={setHoverCoords} />

          <TileLayer url={tileProviders[mapType].url} attribution={tileProviders[mapType].attribution} maxZoom={19} />

          {/* RENDER ONLY ACTIVE SESSION SCANNED BOUNDARIES (Zero Database Clutter / Duplicates) */}
          {scannedBoundaries.map((boundary, idx) => (
            boundary.boundary_polygon && (
              <GeoJSON
                key={`clean-scan-${idx}`}
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