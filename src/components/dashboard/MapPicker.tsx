'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: [number, number];
}

function LocationMarker({ onLocationSelect, initialLocation }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(initialLocation || null);

  const map = useMapEvents({
    click(e: any) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function MapPicker({ onLocationSelect, initialLocation }: MapPickerProps) {
  const purbalinggaCenter: [number, number] = [-7.33, 109.36];
  
  const maxBounds: [[number, number], [number, number]] = [
    [-7.60, 109.15],
    [-7.10, 109.65]
  ];

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-slate-200">
      <MapContainer
        center={initialLocation || purbalinggaCenter}
        zoom={12}
        minZoom={10}
        maxBounds={maxBounds}
        maxBoundsViscosity={1.0}
        className="w-full h-full z-0"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        <LocationMarker onLocationSelect={onLocationSelect} initialLocation={initialLocation} />
      </MapContainer>
    </div>
  );
}
