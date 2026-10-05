'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useState, useEffect } from 'react';

const pickerIcon = L.divIcon({
  html: `
    <div style="
      background-color: #2563eb;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    ">📍</div>
  `,
  className: 'location-picker-marker',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (coords: { lat: number; lng: number }) => void;
}

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom() > 14 ? map.getZoom() : 15, {
      duration: 1.2,
    });
  }, [lat, lng, map]);
  return null;
}

function LocationMarker({ lat, lng, onChange }: { lat: number; lng: number; onChange: (coords: { lat: number; lng: number }) => void }) {
  const [pos, setPos] = useState<[number, number]>([lat, lng]);

  useEffect(() => {
    setPos([lat, lng]);
  }, [lat, lng]);

  useMapEvents({
    click(e) {
      const newCoords: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPos(newCoords);
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return (
    <Marker
      position={pos}
      icon={pickerIcon}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const position = marker.getLatLng();
          setPos([position.lat, position.lng]);
          onChange({ lat: position.lat, lng: position.lng });
        },
      }}
    />
  );
}

export default function LocationPickerInternal({ lat, lng, onChange }: LocationPickerProps) {
  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-sm" style={{ height: '300px', width: '100%' }}>
      <MapContainer center={[lat, lng]} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRecenter lat={lat} lng={lng} />
        <LocationMarker lat={lat} lng={lng} onChange={onChange} />
      </MapContainer>
      <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-xs px-2.5 py-1 rounded backdrop-blur z-[1000] pointer-events-none">
        Click or drag pin to select exact location ({lat.toFixed(4)}, {lng.toFixed(4)})
      </div>
    </div>
  );
}
