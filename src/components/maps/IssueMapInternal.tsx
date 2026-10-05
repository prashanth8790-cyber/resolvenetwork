'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { useEffect } from 'react';

// Custom SVG Icons by Severity
const getSeverityColor = (severity: string) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return '#ef4444'; // Red
    case 'HIGH':
      return '#f97316'; // Orange
    case 'MEDIUM':
      return '#f59e0b'; // Yellow
    case 'LOW':
    default:
      return '#10b981'; // Green
  }
};

const createCustomIcon = (severity: string, pulse = false) => {
  const color = getSeverityColor(severity);
  const pulseRing = pulse
    ? `<div style="
        position: absolute;
        top: -8px; left: -8px;
        width: 40px; height: 40px;
        border-radius: 50%;
        background-color: ${color};
        opacity: 0.25;
        animation: pulse-ring 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
      "></div>`
    : '';
  const svgHtml = `
    <div style="position: relative; width: 24px; height: 24px;">
      ${pulseRing}
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 1;
      ">
      </div>
    </div>
  `;
  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -20],
  });
};

interface IssueMapProps {
  issues: any[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  singleIssue?: boolean;
}

function MapController({ issues, singleIssue }: { issues: any[]; singleIssue?: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (singleIssue || issues.length === 1) {
      // For single issue detail view, just set center — don't fitBounds
      return;
    }
    if (issues && issues.length > 1) {
      const bounds = L.latLngBounds(issues.map((i) => [i.lat, i.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [issues, map, singleIssue]);
  return null;
}

// Inject pulse keyframe CSS once
if (typeof window !== 'undefined') {
  const styleId = 'leaflet-pulse-ring-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes pulse-ring {
        0% { transform: scale(0.6); opacity: 0.6; }
        80%, 100% { transform: scale(1.8); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

export default function IssueMapInternal({
  issues = [],
  center = [37.7749, -122.4194],
  zoom = 12,
  height = '500px',
  singleIssue = false,
}: IssueMapProps) {
  return (
    <div style={{ height, width: '100%', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {issues.length > 0 && <MapController issues={issues} singleIssue={singleIssue} />}
        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.lat, issue.lng]}
            icon={createCustomIcon(issue.severity, singleIssue)}
          >
            <Popup maxWidth={240}>
              <div style={{ minWidth: '200px', padding: '4px 2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span
                    style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      backgroundColor: getSeverityColor(issue.severity),
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {issue.category?.name || 'Issue'}
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px', marginBottom: '4px', lineHeight: 1.3 }}>
                  {issue.title}
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginBottom: '8px' }}>
                  📍 {issue.address}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 500, color: '#334155' }}>
                    {issue.status?.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>👍 {issue._count?.supports ?? issue.supportCount ?? 0}</span>
                </div>
                {!singleIssue && (
                  <a
                    href={`/issues/${issue.id}`}
                    style={{
                      marginTop: '10px', display: 'block', textAlign: 'center',
                      background: '#2563eb', color: 'white', fontSize: '11px',
                      fontWeight: 600, padding: '6px', borderRadius: '6px', textDecoration: 'none',
                    }}
                  >
                    View Details →
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
