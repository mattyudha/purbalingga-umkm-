'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

import { MapContainer, TileLayer, GeoJSON, Marker, useMap } from 'react-leaflet';

interface PurbalinggaMapProps {
  geoJsonData: any;
  umkmData: any[];
  selectedUmkm: any | null;
  onSelectUmkm: (umkm: any | null) => void;
}

function MapController({ selectedUmkm }: { selectedUmkm: any | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedUmkm) {
      map.flyTo([selectedUmkm.latitude, selectedUmkm.longitude], 15, {
        duration: 1.5
      });
    }
  }, [selectedUmkm, map]);

  return null;
}

export default function PurbalinggaMap({ geoJsonData, umkmData, selectedUmkm, onSelectUmkm }: PurbalinggaMapProps) {
  const purbalinggaCenter: [number, number] = [-7.33, 109.36];
  
  const maxBounds: [[number, number], [number, number]] = [
    [-7.60, 109.15],
    [-7.10, 109.65]
  ];

  // Custom Icon Fix for Leaflet in Next.js
  useEffect(() => {
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={purbalinggaCenter}
        zoom={11}
        minZoom={10}
        maxBounds={maxBounds}
        maxBoundsViscosity={1.0}
        className="w-full h-full z-0"
        zoomControl={false} // We will move zoom control
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <MapController selectedUmkm={selectedUmkm} />

        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={{
              color: "#3b82f6",
              weight: 1.5,
              fillColor: "#93c5fd",
              fillOpacity: 0.05,
            }}
            onEachFeature={(feature: any, layer: any) => {
              layer.on({
                mouseover: (e: any) => {
                  e.target.setStyle({ fillOpacity: 0.2, weight: 2.5 });
                },
                mouseout: (e: any) => {
                  e.target.setStyle({ fillOpacity: 0.05, weight: 1.5 });
                },
                click: (e: any) => {
                  // Optional: handle kecamatan click
                }
              });
            }}
          />
        )}

        {umkmData && umkmData.map((umkm) => (
          <Marker 
            key={umkm.id} 
            position={[umkm.latitude, umkm.longitude]}
            eventHandlers={{
              click: () => onSelectUmkm(umkm),
            }}
          />
        ))}
      </MapContainer>

      {/* Floating Controls */}
      <div className="absolute bottom-8 right-8 z-[1000] flex flex-col gap-2">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200 flex flex-col">
          <button 
            className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 border-b text-slate-600 font-bold text-lg"
            onClick={() => {
              // Note: Accessing map instance from outside is tricky without context, 
              // but we can rely on standard zoom controls if needed. 
              // For now, let's keep it simple.
            }}
          >
            +
          </button>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 text-slate-600 font-bold text-lg">
            -
          </button>
        </div>
      </div>
    </div>
  );
}
