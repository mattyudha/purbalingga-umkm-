'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { MapContainer, TileLayer, GeoJSON, Marker, useMap, ZoomControl, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Plus, Minus } from 'lucide-react';

interface PurbalinggaMapProps {
  geoJsonData: any;
  maskData: any;
  umkmData: any[];
  selectedUmkm: any | null;
  onSelectUmkm: (umkm: any | null) => void;
}

function MapController({ selectedUmkm }: { selectedUmkm: any | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedUmkm) {
      map.flyTo([selectedUmkm.latitude, selectedUmkm.longitude], 16, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [selectedUmkm, map]);

  return null;
}

function ZoomButtons() {
  const map = useMap();
  return (
    <div className="absolute bottom-10 right-8 z-[1000] flex flex-col gap-2">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        <button 
          className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 border-b border-slate-100 text-slate-600 transition-colors"
          onClick={() => map.zoomIn()}
          title="Perbesar"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
        <button 
          className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors"
          onClick={() => map.zoomOut()}
          title="Perkecil"
        >
          <Minus size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

export default function PurbalinggaMap({ geoJsonData, maskData, umkmData, selectedUmkm, onSelectUmkm }: PurbalinggaMapProps) {
  // Koordinat pusat Purbalingga yang lebih optimal
  const purbalinggaCenter: [number, number] = [-7.35, 109.37];
  
  // Batas administratif yang diperketat (Extreme Strict Bounds)
  const maxBounds: [[number, number], [number, number]] = [
    [-7.58, 109.22], // SouthWest 
    [-7.12, 109.53]  // NorthEast
  ];

  // Custom Icon Fix for Leaflet in Next.js
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
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
        zoom={12.3}
        minZoom={12}
        maxZoom={18}
        maxBounds={maxBounds}
        maxBoundsViscosity={1.0}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <MapController selectedUmkm={selectedUmkm} />
        <ZoomButtons />

        {/* Masking Layer (Spotlight) */}
        {maskData && (
          <GeoJSON 
            data={maskData}
            style={{
              color: 'transparent',
              fillColor: '#0f172a',
              fillOpacity: 0.4,
            }}
            interactive={false}
          />
        )}

        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={(feature) => ({
              color: "#3b82f6",
              weight: 1.5,
              fillColor: "#ffffff",
              fillOpacity: 0.1,
            })}
            onEachFeature={(feature: any, layer: any) => {
              layer.on({
                mouseover: (e: any) => {
                  e.target.setStyle({ fillOpacity: 0.4, weight: 2.5, fillColor: '#3b82f6' });
                },
                mouseout: (e: any) => {
                  e.target.setStyle({ fillOpacity: 0.1, weight: 1.5, fillColor: '#ffffff' });
                },
                click: (e: any) => {
                  const map = e.target._map;
                  map.flyToBounds(e.target.getBounds(), {
                    padding: [50, 50],
                    duration: 1.5
                  });
                }
              });
              
              const popupContent = `
                <div class="font-sans p-1">
                  <p class="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Kecamatan</p>
                  <p class="text-sm font-black text-slate-800 leading-none">${feature.properties.Nama_kecamatan}</p>
                </div>
              `;
              layer.bindPopup(popupContent, { closeButton: false, offset: [0, -5] });
              
              layer.bindTooltip(feature.properties.Nama_kecamatan, {
                permanent: true,
                direction: 'center',
                className: 'kecamatan-tooltip'
              });
            }}
          />
        )}

        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          iconCreateFunction={(cluster: any) => {
            const count = cluster.getChildCount();
            return L.divIcon({
              html: `
                <div class="flex flex-col items-center justify-center">
                  <span class="text-[10px] font-black leading-none">${count}</span>
                  <span class="text-[6px] font-bold uppercase tracking-tighter leading-none mt-0.5">UMKM</span>
                </div>
              `,
              className: 'custom-marker-cluster',
              iconSize: L.point(44, 44),
            });
          }}
        >
          {umkmData && umkmData.map((umkm) => (
            <Marker 
              key={umkm.id} 
              position={[umkm.latitude, umkm.longitude]}
              eventHandlers={{
                click: () => onSelectUmkm(umkm),
              }}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
