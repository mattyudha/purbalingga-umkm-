'use client';

import React, { useEffect, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import simplify from '@turf/simplify';

import { MapContainer, TileLayer, GeoJSON, Marker, Polyline, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Plus, Minus, MapPin, Layers, Store, Map, Satellite, Mountain, Check, Search, Navigation, X, BarChart3, TrendingUp, Building2, Filter, Route, Eye, EyeOff, Settings2, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  isCleanMode?: boolean;
  onToggleCleanMode?: () => void;
}

function getFeatureBounds(feature: any): L.LatLngBounds {
  return L.geoJSON(feature).getBounds();
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
    <div className="absolute bottom-[110px] right-2 sm:bottom-8 sm:right-4 z-[1000] flex flex-col gap-2">
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
    <div className="absolute bottom-[110px] left-2 sm:bottom-8 sm:left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-3 min-w-[160px] sm:min-w-[200px] hidden sm:block">
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
    <div className="hidden sm:block absolute top-20 left-4 sm:top-4 sm:left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 px-3 sm:px-4 py-2 sm:py-3 transition-all">
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

function MapControlMenu({
  activeLayer,
  setActiveLayer,
  umkmData,
  activeCategories,
  setActiveCategories,
  showTourRoute,
  setShowTourRoute,
  isCleanMode,
  onToggleCleanMode,
  geoJsonData,
  villageData,
  setTargetFeature,
  onSelectDesa
}: {
  activeLayer: MapLayerType;
  setActiveLayer: (layer: MapLayerType) => void;
  umkmData: any[];
  activeCategories: Set<string>;
  setActiveCategories: (cats: Set<string>) => void;
  showTourRoute: boolean;
  setShowTourRoute: (show: boolean) => void;
  isCleanMode?: boolean;
  onToggleCleanMode?: () => void;
  geoJsonData: any;
  villageData: any;
  setTargetFeature: (feature: any) => void;
  onSelectDesa: (desa: string | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'main' | 'layer' | 'category' | 'search'>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Search Results Logic
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
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
  }, [searchQuery, geoJsonData, villageData]);

  const handleSelectSearch = (feature: any) => {
    setTargetFeature(feature);
    setSearchQuery('');
    closeMenu();
  };

  const categories = useMemo(() => {
    return Array.from(new Set(umkmData.map((u) => u.kategori_umkm?.nama).filter(Boolean)));
  }, [umkmData]);

  const toggleCategory = (cat: string) => {
    const next = new Set(activeCategories);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setActiveCategories(next);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setTimeout(() => setView('main'), 300);
  };

  return (
    <div className="absolute top-[5.5rem] right-4 sm:top-20 sm:right-4 z-[1000] transition-all">
      {/* Trigger Button */}
      <button
        onClick={() => {
          if (isOpen) closeMenu();
          else setIsOpen(true);
        }}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl border-2 backdrop-blur-md ${
          isOpen ? 'bg-slate-900 border-slate-700 text-white shadow-slate-900/30' : 'bg-white/95 border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
        title="Pengaturan Peta"
      >
        <Settings2 size={24} strokeWidth={2.5} className={isOpen ? 'rotate-90 transition-transform duration-300' : 'transition-transform duration-300'} />
      </button>

      {/* Assistive Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-40 bg-slate-900/20 md:bg-transparent"
              onClick={closeMenu}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20, x: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20, x: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute right-0 top-16 w-[280px] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden z-50 text-slate-800"
            >
              <AnimatePresence mode="wait">
                {view === 'main' && (
                  <motion.div 
                    key="main"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 flex flex-col gap-3"
                  >
                    {/* Search Trigger (Full Width) */}
                    <button onClick={() => { setView('search'); setTimeout(() => searchInputRef.current?.focus(), 100); }} className="w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                      <div className="flex items-center gap-3 text-slate-700">
                        <Search size={20} className="text-blue-500" />
                        <span className="text-sm font-bold">Cari Lokasi...</span>
                      </div>
                      <ChevronLeft size={16} className="text-slate-400 rotate-180" />
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Lapisan Peta */}
                      <button onClick={() => setView('layer')} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                        <Layers size={24} className="text-blue-600" />
                        <span className="text-[11px] font-bold text-slate-700">Lapisan Peta</span>
                      </button>

                      {/* Kategori */}
                      <button onClick={() => setView('category')} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 relative">
                        {activeCategories.size > 0 && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        )}
                        <Filter size={24} className="text-emerald-600" />
                        <span className="text-[11px] font-bold text-slate-700">Filter UMKM</span>
                      </button>

                      {/* Rute Wisata */}
                      <button 
                        onClick={() => { setShowTourRoute(!showTourRoute); closeMenu(); }} 
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-colors border ${showTourRoute ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
                      >
                        <Route size={24} className={showTourRoute ? 'text-amber-500' : 'text-amber-500/70'} />
                        <span className={`text-[11px] font-bold ${showTourRoute ? 'text-amber-700' : 'text-slate-700'}`}>Rute Wisata</span>
                      </button>

                      {/* Zen Mode */}
                      <button 
                        onClick={() => { if (onToggleCleanMode) onToggleCleanMode(); closeMenu(); }} 
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-colors border ${isCleanMode ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
                      >
                        {isCleanMode ? <Eye size={24} className="text-blue-600" /> : <EyeOff size={24} className="text-slate-400" />}
                        <span className={`text-[11px] font-bold ${isCleanMode ? 'text-blue-700' : 'text-slate-700'}`}>Peta Penuh</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {view === 'search' && (
                  <motion.div 
                    key="search"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col max-h-[350px]"
                  >
                    <div className="flex items-center gap-2 p-4 border-b border-slate-100 bg-slate-50/50">
                      <button onClick={() => setView('main')} className="p-1 shrink-0 rounded-full hover:bg-slate-200 transition-colors">
                        <ChevronLeft size={18} className="text-slate-600" />
                      </button>
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari kecamatan / desa..."
                        className="w-full bg-transparent border-none focus:outline-none text-sm font-medium text-slate-800 placeholder-slate-400"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="p-1 shrink-0 text-slate-400 hover:text-slate-600">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                      {searchResults.length > 0 ? (
                        searchResults.map((feature: any, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectSearch(feature)}
                            className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                              {feature._type === 'kecamatan' ? (
                                <MapPin size={16} className="text-blue-600" />
                              ) : (
                                <Building2 size={16} className="text-blue-500" />
                              )}
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-slate-800">
                                {feature._type === 'kecamatan' ? `Kecamatan ${feature.properties?.district}` : feature.properties?.village}
                              </h5>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {feature._type === 'kecamatan' ? 'Pusat Pemerintahan' : `Kec. ${feature.properties?.district}, Banyumas`}
                              </p>
                            </div>
                          </button>
                        ))
                      ) : searchQuery.length > 0 ? (
                        <div className="py-8 text-center">
                          <MapPin size={20} className="text-slate-300 mx-auto mb-2" />
                          <p className="text-xs text-slate-500 font-medium">Tidak ditemukan</p>
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <Search size={20} className="text-slate-300 mx-auto mb-2" />
                          <p className="text-xs text-slate-500 font-medium">Ketik untuk mencari lokasi</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {view === 'layer' && (
                  <motion.div 
                    key="layer"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-2 p-4 border-b border-slate-100 bg-slate-50/50">
                      <button onClick={() => setView('main')} className="p-1 rounded-full hover:bg-slate-200 transition-colors">
                        <ChevronLeft size={18} className="text-slate-600" />
                      </button>
                      <span className="font-bold text-sm tracking-wide text-slate-800">Lapisan Peta</span>
                    </div>
                    <div className="p-3 space-y-2">
                      {mapLayers.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => { setActiveLayer(l.id); closeMenu(); }}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                            activeLayer === l.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'hover:bg-slate-50 border-transparent'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${l.previewGradient} shadow-inner`}>
                            <l.icon size={16} className="text-slate-800" strokeWidth={2.5} />
                          </div>
                          <div className="text-left flex-1">
                            <h5 className={`text-xs font-bold ${activeLayer === l.id ? 'text-blue-700' : 'text-slate-700'}`}>{l.name}</h5>
                            <p className="text-[9px] text-slate-500 mt-0.5">{l.description}</p>
                          </div>
                          {activeLayer === l.id && <Check size={16} className="text-blue-600" strokeWidth={3} />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {view === 'category' && (
                  <motion.div 
                    key="category"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setView('main')} className="p-1 rounded-full hover:bg-slate-200 transition-colors">
                          <ChevronLeft size={18} className="text-slate-600" />
                        </button>
                        <span className="font-bold text-sm tracking-wide text-slate-800">Filter UMKM</span>
                      </div>
                      {activeCategories.size > 0 && (
                        <button onClick={() => setActiveCategories(new Set())} className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors">
                          Reset
                        </button>
                      )}
                    </div>
                    <div className="p-3 space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {categories.map((cat) => {
                        const isActive = activeCategories.has(cat);
                        return (
                          <button
                            key={cat}
                            onClick={() => toggleCategory(cat)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                              isActive ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'hover:bg-slate-50 border-transparent'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isActive ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                            }`}>
                              {isActive && <Check size={10} className="text-white" strokeWidth={3} />}
                            </div>
                            <span className={`text-xs font-bold ${isActive ? 'text-emerald-700' : 'text-slate-700'}`}>{cat}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
    <div className="absolute top-16 left-2 sm:top-20 sm:left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 px-3 py-2 sm:px-4 sm:py-3 hidden md:block">
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


export default function BanyumasMap({ geoJsonData, outlineData, maskData, villageData, umkmData, selectedUmkm, onSelectUmkm, selectedDesa, onSelectDesa, isCleanMode, onToggleCleanMode }: BanyumasMapProps) {
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
      {!isCleanMode && (
        <>
          <MapLegend />
          <MapInfoBadge />
          <MapStatsWidget umkmData={umkmData} selectedDesa={selectedDesa} />
        </>
      )}

      {/* Assistive Map Control Menu (Always visible so user can exit Clean Mode) */}
      <MapControlMenu 
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
        umkmData={umkmData}
        activeCategories={activeCategories}
        setActiveCategories={setActiveCategories}
        showTourRoute={showTourRoute}
        setShowTourRoute={setShowTourRoute}
        isCleanMode={isCleanMode}
        onToggleCleanMode={onToggleCleanMode}
        geoJsonData={geoJsonData}
        villageData={villageData}
        setTargetFeature={setTargetFeature}
        onSelectDesa={onSelectDesa}
      />

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
