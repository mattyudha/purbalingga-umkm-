'use client';

import React, { useEffect, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import simplify from '@turf/simplify';

import { MapContainer, TileLayer, GeoJSON, Marker, Polyline, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Plus, Minus, MapPin, Layers, Store, Map, Satellite, Mountain, Check, Search, Navigation, X, BarChart3, TrendingUp, Building2, Filter, Route } from 'lucide-react';

interface BanyumasMapProps {
  geoJsonData: any;
  outlineData: any;
  maskData: any;
  villageData: any;
  umkmData: any[];
  selectedUmkm: any | null;
  onSelectUmkm: (umkm: any | null) => void;
  selectedDesa: string | null;
  onSelectDesa: (desa: string | null) => void;
}

function getFeatureBounds(feature: any): L.LatLngBounds {
  return L.geoJSON(feature).getBounds();
}

function SearchKecamatan({ geoJsonData, villageData, onSelectFeature, onSelectDesa }: { geoJsonData: any; villageData: any; onSelectFeature: (feature: any) => void; onSelectDesa: (desa: string | null) => void }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const results = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    const kecamatanResults = geoJsonData?.features
      ? geoJsonData.features
          .filter((f: any) => {
            const district = f.properties?.district?.toLowerCase() || '';
            return district.includes(q);
          })
          .map((f: any) => ({ ...f, _type: 'kecamatan' as const }))
      : [];
    const desaResults = villageData?.features
      ? villageData.features
          .filter((f: any) => {
            const village = f.properties?.village?.toLowerCase() || '';
            const district = f.properties?.district?.toLowerCase() || '';
            return village.includes(q) || district.includes(q);
          })
          .map((f: any) => ({ ...f, _type: 'desa' as const }))
      : [];
    return [...desaResults, ...kecamatanResults];
  }, [query, geoJsonData, villageData]);

  const handleSelect = (feature: any) => {
    onSelectFeature(feature);
    setQuery('');
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="absolute top-4 right-4 z-[1000]">
      <div className="relative">
        {/* Search Input */}
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl shadow-lg border transition-all duration-200 bg-white/95 backdrop-blur-sm ${
          isOpen ? 'border-blue-300 shadow-xl ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-300'
        }`}>
          <Search size={16} className="text-slate-400 flex-shrink-0" strokeWidth={2.5} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => query.trim() && setIsOpen(true)}
            placeholder="Cari nama desa/kecamatan di Kabupaten Banyumas"
            className="bg-transparent border-none outline-none text-xs font-medium text-slate-700 placeholder:text-slate-400 w-64 sm:w-72"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Results Dropdown */}
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Navigation size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Cari Daerah</h4>
                    <p className="text-[10px] text-slate-500">
                      {results.length} hasil ditemukan
                    </p>
                  </div>
                </div>
              </div>

              {/* Results List */}
              <div className="p-2 max-h-64 overflow-y-auto">
                {results.length > 0 ? (
                  results.map((feature: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleSelect(feature)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-blue-50 border border-transparent hover:border-blue-100 text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <MapPin size={14} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">
                          {feature._type === 'desa'
                            ? feature.properties?.village || 'Tidak diketahui'
                            : feature.properties?.district || 'Tidak diketahui'}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {feature._type === 'desa'
                            ? `Desa ${feature.properties?.village || ''}, Kec. ${feature.properties?.district || 'Baturaden'}`
                            : `Kecamatan ${feature.properties?.district || ''}, Kab. Banyumas`}
                        </p>
                      </div>
                      <Navigation size={12} className="text-slate-300 flex-shrink-0" />
                    </button>
                  ))
                ) : query.trim() ? (
                  <div className="px-4 py-6 text-center">
                    <MapPin size={20} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Tidak ditemukan</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Coba kata kunci lain</p>
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <Search size={20} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Ketik untuk mencari</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Nama kecamatan atau desa</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
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

function MapFlyTo({ targetFeature }: { targetFeature: any | null }) {
  const map = useMap();

  useEffect(() => {
    if (targetFeature) {
      const bounds = getFeatureBounds(targetFeature);
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [targetFeature, map]);

  return null;
}

function ZoomLabelController() {
  const map = useMap();

  useEffect(() => {
    const updateLabels = () => {
      const zoom = map.getZoom();
      map.eachLayer((layer: any) => {
        const tooltip = layer.getTooltip?.();
        if (tooltip) {
          const el = tooltip.getElement?.();
          if (el) {
            if (el.classList.contains('kecamatan-tooltip-modern')) {
              el.style.display = zoom >= 11 ? '' : 'none';
            } else if (
              el.classList.contains('desa-tooltip-modern') ||
              el.classList.contains('desa-tooltip-subtle') ||
              el.classList.contains('desa-tooltip-primary')
            ) {
              // Desa labels only visible at zoom >= 13
              el.style.display = zoom >= 13 ? '' : 'none';
            }
          }
        }
      });
    };

    updateLabels();
    map.on('zoomend', updateLabels);
    return () => {
      map.off('zoomend', updateLabels);
    };
  }, [map]);

  return null;
}

function BaturadenFocusController({ baturadenFeature }: { baturadenFeature: any | null }) {
  const map = useMap();
  const hasZoomed = React.useRef(false);

  useEffect(() => {
    if (baturadenFeature && !hasZoomed.current) {
      hasZoomed.current = true;
      const bounds = getFeatureBounds(baturadenFeature);
      // Delay slightly to ensure map is ready
      const timer = setTimeout(() => {
        map.flyToBounds(bounds, { padding: [120, 120], duration: 1.8, easeLinearity: 0.25 });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [baturadenFeature, map]);

  return null;
}

function ZoomButtons() {
  const map = useMap();
  return (
    <div className="absolute bottom-8 right-4 z-[1000] flex flex-col gap-2">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 flex flex-col">
        <button 
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 border-b border-slate-100 text-slate-600 transition-colors"
          onClick={() => map.zoomIn()}
          title="Perbesar"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
        <button 
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors"
          onClick={() => map.zoomOut()}
          title="Perkecil"
        >
          <Minus size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

function MapLegend() {
  return (
    <div className="absolute bottom-8 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-3 min-w-[200px]">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
        <Layers size={14} className="text-blue-600" />
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Legenda Peta</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-700" />
          <span className="text-[11px] text-slate-600 font-medium">Wilayah Fokus (Baturaden)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-[2px] bg-blue-500" />
          <span className="text-[11px] text-slate-600 font-medium">Batas Kecamatan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-[2px] bg-indigo-600 border-dashed" style={{ borderTop: '2px dashed #4f46e5' }} />
          <span className="text-[11px] text-slate-600 font-medium">Batas Desa (Baturaden)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
            <Store size={8} className="text-white" />
          </div>
          <span className="text-[11px] text-slate-600 font-medium">Lokasi UMKM</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[7px] text-white font-bold">3</div>
          <span className="text-[11px] text-slate-600 font-medium">Kumpulan UMKM</span>
        </div>
      </div>
    </div>
  );
}

function MapInfoBadge() {
  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <MapPin size={16} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Kecamatan Baturaden</h3>
          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Kab. Banyumas, Jawa Tengah • 12 Desa</p>
        </div>
      </div>
    </div>
  );
}

function CategoryLayerToggle({ umkmData, activeCategories, onChange }: { umkmData: any[]; activeCategories: Set<string>; onChange: (cats: Set<string>) => void }) {
  const categories = useMemo(() => {
    const cats = Array.from(new Set(umkmData.map((u) => u.kategori_umkm?.nama).filter(Boolean)));
    return cats;
  }, [umkmData]);

  const [isOpen, setIsOpen] = useState(false);

  const toggleCategory = (cat: string) => {
    const next = new Set(activeCategories);
    if (next.has(cat)) {
      next.delete(cat);
    } else {
      next.add(cat);
    }
    onChange(next);
  };

  const clearAll = () => onChange(new Set());

  return (
    <div className="absolute top-28 right-4 z-[1000]">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl shadow-lg border transition-all duration-200 ${
            isOpen || activeCategories.size > 0
              ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/25'
              : 'bg-white/95 backdrop-blur-sm border-slate-200 text-slate-700 hover:border-emerald-300 hover:shadow-xl'
          }`}
          title="Filter kategori UMKM"
        >
          <Filter size={16} strokeWidth={2.5} />
          <span className="text-xs font-bold hidden sm:inline">
            {activeCategories.size > 0 ? `${activeCategories.size} Kategori` : 'Kategori'}
          </span>
          <Store size={14} strokeWidth={2.5} className="opacity-70" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Filter size={14} className="text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Filter Kategori</h4>
                    <p className="text-[10px] text-slate-500">Tampilkan/Sembunyikan UMKM</p>
                  </div>
                </div>
                {activeCategories.size > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="p-2 space-y-1">
                {categories.map((cat) => {
                  const isActive = activeCategories.has(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
                        isActive
                          ? 'bg-emerald-50 border border-emerald-200 shadow-sm'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isActive ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                        }`}
                      >
                        {isActive && <Check size={10} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-xs font-bold ${isActive ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {cat}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TourRouteButton({ showTourRoute, onToggle }: { showTourRoute: boolean; onToggle: () => void }) {
  return (
    <div className="absolute top-40 right-4 z-[1000]">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl shadow-lg border transition-all duration-200 ${
          showTourRoute
            ? 'bg-amber-500 border-amber-400 text-white shadow-amber-500/25'
            : 'bg-white/95 backdrop-blur-sm border-slate-200 text-slate-700 hover:border-amber-300 hover:shadow-xl'
        }`}
        title="Rute Wisata UMKM"
      >
        <Route size={16} strokeWidth={2.5} />
        <span className="text-xs font-bold hidden sm:inline">
          {showTourRoute ? 'Sembunyikan Rute' : 'Rute Wisata'}
        </span>
      </button>
    </div>
  );
}

function TourRoutePolyline({ umkmData }: { umkmData: any[] }) {
  const routePositions = useMemo(() => {
    if (umkmData.length < 2) return [];
    // Nearest neighbor algorithm
    const unvisited = [...umkmData];
    const route: any[] = [unvisited.shift()];
    while (unvisited.length > 0) {
      const last = route[route.length - 1];
      let nearestIdx = 0;
      let nearestDist = Infinity;
      unvisited.forEach((u, idx) => {
        const dist = Math.hypot(u.latitude - last.latitude, u.longitude - last.longitude);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = idx;
        }
      });
      route.push(unvisited.splice(nearestIdx, 1)[0]);
    }
    return route.map((u) => [u.latitude, u.longitude] as [number, number]);
  }, [umkmData]);

  if (routePositions.length < 2) return null;

  return (
    <>
      <Polyline
        positions={routePositions}
        pathOptions={{
          color: '#f59e0b',
          weight: 3,
          opacity: 0.85,
          dashArray: '8, 8',
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
      {/* Route number markers */}
      {routePositions.map((pos, idx) => (
        <Marker
          key={`route-${idx}`}
          position={pos}
          interactive={false}
          icon={L.divIcon({
            html: `<div style="width:20px;height:20px;border-radius:50%;background:#f59e0b;color:#fff;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(245,158,11,0.4);">${idx + 1}</div>`,
            className: 'route-number-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })}
        />
      ))}
    </>
  );
}

function MapStatsWidget({ umkmData, selectedDesa }: { umkmData: any[]; selectedDesa: string | null }) {
  const stats = useMemo(() => {
    const total = umkmData.length;
    const desaCounts: Record<string, number> = {};
    const catCounts: Record<string, number> = {};
    umkmData.forEach((u) => {
      const desa = u._desa || 'Lainnya';
      desaCounts[desa] = (desaCounts[desa] || 0) + 1;
      const cat = u.kategori_umkm?.nama || 'Lainnya';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });
    const topDesa = Object.entries(desaCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
    return { total, topDesa, topCat };
  }, [umkmData]);

  if (!umkmData.length) return null;

  return (
    <div className="absolute top-20 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 px-4 py-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
            <BarChart3 size={14} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-medium leading-tight">Total UMKM</p>
            <p className="text-sm font-bold text-slate-800 leading-tight">{stats.total}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <TrendingUp size={14} className="text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-medium leading-tight">Kategori Top</p>
            <p className="text-sm font-bold text-slate-800 leading-tight">{stats.topCat?.[0] || '-'}</p>
          </div>
        </div>
        {selectedDesa && (
          <>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <Building2 size={14} className="text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">Desa {selectedDesa}</p>
                <p className="text-sm font-bold text-slate-800 leading-tight">
                  {umkmData.filter((u) => u._desa === selectedDesa).length} UMKM
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type MapLayerType = 'street' | 'satellite' | 'terrain';

interface MapLayerOption {
  id: MapLayerType;
  name: string;
  description: string;
  url: string;
  attribution: string;
  icon: React.ElementType;
  previewGradient: string;
}

const mapLayers: MapLayerOption[] = [
  {
    id: 'street',
    name: 'Jalan',
    description: 'Peta jalan standar',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    icon: Map,
    previewGradient: 'from-slate-100 to-slate-300',
  },
  {
    id: 'satellite',
    name: 'Satelit',
    description: 'Citra satelit',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
    icon: Satellite,
    previewGradient: 'from-emerald-800 to-teal-900',
  },
  {
    id: 'terrain',
    name: 'Terrain',
    description: 'Peta topografi',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap',
    icon: Mountain,
    previewGradient: 'from-amber-100 to-orange-200',
  },
];

function LayerSwitcher({ activeLayer, onChange }: { activeLayer: MapLayerType; onChange: (layer: MapLayerType) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const currentLayer = mapLayers.find((l) => l.id === activeLayer)!;

  return (
    <div className="absolute top-16 right-4 z-[1000]">
      <div className="relative">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl shadow-lg border transition-all duration-200 ${
            isOpen
              ? 'bg-blue-600 border-blue-500 text-white shadow-blue-500/25'
              : 'bg-white/95 backdrop-blur-sm border-slate-200 text-slate-700 hover:border-blue-300 hover:shadow-xl'
          }`}
          title="Ganti lapisan peta"
        >
          <currentLayer.icon size={16} strokeWidth={2.5} />
          <span className="text-xs font-bold hidden sm:inline">{currentLayer.name}</span>
          <Layers size={14} strokeWidth={2.5} className="opacity-70" />
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Layers size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Lapisan Peta</h4>
                    <p className="text-[10px] text-slate-500">Pilih tampilan peta</p>
                  </div>
                </div>
              </div>

              {/* Layer Options */}
              <div className="p-2 space-y-1">
                {mapLayers.map((layer) => {
                  const isActive = activeLayer === layer.id;
                  const Icon = layer.icon;
                  return (
                    <button
                      key={layer.id}
                      onClick={() => {
                        onChange(layer.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? 'bg-blue-50 border border-blue-200 shadow-sm'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      {/* Preview Thumbnail */}
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${layer.previewGradient} flex items-center justify-center shadow-sm flex-shrink-0`}
                      >
                        <Icon
                          size={18}
                          className={`${
                            isActive ? 'text-blue-600' : 'text-slate-500'
                          } drop-shadow-sm`}
                          strokeWidth={2}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-bold ${
                              isActive ? 'text-blue-700' : 'text-slate-700'
                            }`}
                          >
                            {layer.name}
                          </span>
                          {isActive && (
                            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-600">
                              <Check size={10} className="text-white" strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{layer.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function BanyumasMap({ geoJsonData, outlineData, maskData, villageData, umkmData, selectedUmkm, onSelectUmkm, selectedDesa, onSelectDesa }: BanyumasMapProps) {
  const banyumasCenter: [number, number] = [-7.41, 109.23];
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('street');
  const [targetFeature, setTargetFeature] = useState<any | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [showTourRoute, setShowTourRoute] = useState(false);

  // Simplify village boundaries for cleaner lines
  const simplifiedVillageData = useMemo(() => {
    if (!villageData) return null;
    try {
      return simplify(villageData, { tolerance: 0.0004, highQuality: true });
    } catch {
      return villageData;
    }
  }, [villageData]);

  // Extract Baturaden feature for highlight and auto-zoom
  const baturadenFeature = useMemo(() => {
    if (!geoJsonData?.features) return null;
    return geoJsonData.features.find((f: any) => f.properties?.district === 'Baturraden');
  }, [geoJsonData]);
  
  const maxBounds: [[number, number], [number, number]] = [
    [-7.75, 108.85],
    [-7.20, 109.55]
  ];

  const currentLayer = mapLayers.find((l) => l.id === activeLayer)!;

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
      {/* UI Overlays — outside MapContainer to avoid Leaflet appendChild errors */}
      <SearchKecamatan geoJsonData={geoJsonData} villageData={villageData} onSelectFeature={setTargetFeature} onSelectDesa={onSelectDesa} />
      <LayerSwitcher activeLayer={activeLayer} onChange={setActiveLayer} />
      <CategoryLayerToggle umkmData={umkmData} activeCategories={activeCategories} onChange={setActiveCategories} />
      <TourRouteButton showTourRoute={showTourRoute} onToggle={() => setShowTourRoute(!showTourRoute)} />
      <MapLegend />
      <MapInfoBadge />
      <MapStatsWidget umkmData={umkmData} selectedDesa={selectedDesa} />

      <MapContainer
        center={banyumasCenter}
        zoom={11.5}
        minZoom={11}
        maxZoom={18}
        maxBounds={maxBounds}
        maxBoundsViscosity={1.0}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          key={activeLayer}
          url={currentLayer.url}
          attribution={currentLayer.attribution}
        />

        <MapController selectedUmkm={selectedUmkm} />
        <MapFlyTo targetFeature={targetFeature} />
        <ZoomLabelController />
        <BaturadenFocusController baturadenFeature={baturadenFeature} />
        <ZoomButtons />

        {/* Outline for entire Banyumas area - transparent fill so kecamatan lines stay visible */}
        {outlineData && (
          <GeoJSON 
            data={outlineData}
            style={{
              color: '#2563eb',
              weight: 2.5,
              fillColor: 'transparent',
              fillOpacity: 0,
            }}
            interactive={false}
          />
        )}

        {/* Dark overlay for area outside Banyumas */}
        {maskData && (
          <GeoJSON 
            data={maskData}
            style={{
              color: 'transparent',
              fillColor: '#0f172a',
              fillOpacity: 0.45,
              fillRule: 'evenodd',
            }}
            interactive={false}
          />
        )}

        {/* Highlight Kecamatan Baturaden — Glow ring only, no fill */}
        {geoJsonData && (
          <GeoJSON
            data={{
              type: 'FeatureCollection',
              features: geoJsonData.features.filter((f: any) => f.properties?.district === 'Baturraden'),
            } as any}
            style={{
              color: '#2563eb',
              weight: 4,
              fillColor: 'transparent',
              fillOpacity: 0,
              opacity: 0.9,
            }}
            interactive={false}
          />
        )}

        {/* Kecamatan boundaries with labels (all Banyumas) */}
        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={(feature) => ({
              color: feature?.properties?.district === 'Baturraden' ? 'transparent' : '#3b82f6',
              weight: feature?.properties?.district === 'Baturraden' ? 0 : 1.5,
              fillColor: 'transparent',
              fillOpacity: 0,
              dashArray: feature?.properties?.district === 'Baturraden' ? '0' : '4, 4',
            })}
            onEachFeature={(feature: any, layer: any) => {
              // Skip Baturraden — it has its own village labels
              if (feature.properties?.district === 'Baturraden') return;
              layer.on({
                mouseover: (e: any) => {
                  e.target.setStyle({ 
                    fillOpacity: 0.12, 
                    weight: 3, 
                    fillColor: '#dbeafe', 
                    color: '#1d4ed8',
                    dashArray: '0',
                  });
                  layer.openTooltip();
                },
                mouseout: (e: any) => {
                  e.target.setStyle({ 
                    fillOpacity: 0, 
                    weight: 1.5, 
                    fillColor: 'transparent', 
                    color: '#3b82f6',
                    dashArray: '4, 4',
                  });
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
                <div style="font-family: system-ui, sans-serif; min-width: 160px;">
                  <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 8px 12px; border-radius: 8px 8px 0 0;">
                    <p style="color: white; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">Kecamatan</p>
                  </div>
                  <div style="padding: 10px 12px; background: white; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
                    <p style="font-size: 14px; font-weight: 800; color: #1e293b; margin: 0;">${feature.properties.district}</p>
                    <p style="font-size: 10px; color: #64748b; margin: 4px 0 0 0;">Kabupaten Banyumas</p>
                  </div>
                </div>
              `;
              layer.bindPopup(popupContent, { closeButton: true, offset: [0, -5] });
              
              layer.bindTooltip(feature.properties.district, {
                permanent: true,
                direction: 'center',
                className: 'kecamatan-tooltip-modern',
                opacity: 1,
              });
            }}
          />
        )}

        {/* Desa boundaries inside Baturaden — Simplified & Restyled */}
        {simplifiedVillageData && (
          <GeoJSON
            data={simplifiedVillageData}
            style={(feature) => {
              const isKemutugLor = feature?.properties?.village === 'Kemutug Lor';
              return {
                color: isKemutugLor ? '#2563eb' : '#94a3b8',
                weight: isKemutugLor ? 2 : 0.8,
                fillColor: isKemutugLor ? '#dbeafe' : 'transparent',
                fillOpacity: isKemutugLor ? 0.35 : 0,
                dashArray: '0',
                opacity: isKemutugLor ? 1 : 0.65,
              };
            }}
            onEachFeature={(feature: any, layer: any) => {
              const isKemutugLor = feature.properties?.village === 'Kemutug Lor';
              layer.on({
                mouseover: (e: any) => {
                  e.target.setStyle({ 
                    fillOpacity: isKemutugLor ? 0.45 : 0.15, 
                    weight: isKemutugLor ? 2.5 : 1.2, 
                    fillColor: '#dbeafe', 
                    color: '#2563eb',
                    opacity: 1,
                  });
                  layer.openTooltip();
                },
                mouseout: (e: any) => {
                  e.target.setStyle({ 
                    fillOpacity: isKemutugLor ? 0.35 : 0, 
                    weight: isKemutugLor ? 2 : 0.8, 
                    fillColor: isKemutugLor ? '#dbeafe' : 'transparent', 
                    color: isKemutugLor ? '#2563eb' : '#94a3b8',
                    opacity: isKemutugLor ? 1 : 0.65,
                  });
                },
                click: (e: any) => {
                  const map = e.target._map;
                  map.flyToBounds(e.target.getBounds(), {
                    padding: [80, 80],
                    duration: 1.5
                  });
                  onSelectDesa(feature.properties?.village || null);
                }
              });
              
              const popupContent = `
                <div style="font-family: system-ui, sans-serif; min-width: 160px;">
                  <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 8px 12px; border-radius: 8px 8px 0 0;">
                    <p style="color: white; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">Desa</p>
                  </div>
                  <div style="padding: 10px 12px; background: white; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
                    <p style="font-size: 14px; font-weight: 800; color: #1e293b; margin: 0;">${feature.properties.village}</p>
                    <p style="font-size: 10px; color: #64748b; margin: 4px 0 0 0;">Kec. Baturaden, Kab. Banyumas</p>
                  </div>
                </div>
              `;
              layer.bindPopup(popupContent, { closeButton: true, offset: [0, -5] });

              // Text-only labels: subtle for normal desa, prominent for Kemutug Lor
              const labelClass = isKemutugLor ? 'desa-tooltip-primary' : 'desa-tooltip-subtle';
              layer.bindTooltip(feature.properties.village, {
                permanent: true,
                direction: 'center',
                className: labelClass,
                opacity: 1,
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
                  <span class="text-[11px] font-black leading-none">${count}</span>
                  <span class="text-[7px] font-bold uppercase tracking-tighter leading-none mt-0.5">UMKM</span>
                </div>
              `,
              className: 'custom-marker-cluster',
              iconSize: L.point(44, 44),
            });
          }}
        >
          {umkmData && umkmData
            .filter((umkm) => activeCategories.size === 0 || activeCategories.has(umkm.kategori_umkm?.nama))
            .map((umkm) => (
              <Marker 
                key={umkm.id} 
                position={[umkm.latitude, umkm.longitude]}
                eventHandlers={{
                  click: () => onSelectUmkm(umkm),
                }}
              />
            ))}
        </MarkerClusterGroup>

        {/* Tour Route Polyline */}
        {showTourRoute && (
          <TourRoutePolyline
            umkmData={umkmData.filter((umkm) => activeCategories.size === 0 || activeCategories.has(umkm.kategori_umkm?.nama))}
          />
        )}
      </MapContainer>
    </div>
  );
}
