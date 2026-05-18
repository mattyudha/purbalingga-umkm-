'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
const BanyumasMap = dynamic(() => import('@/components/map/BanyumasMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Memuat Peta...</div>
});
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Menu } from 'lucide-react';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

export default function Home() {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [outlineData, setOutlineData] = useState<any>(null);
  const [maskData, setMaskData] = useState<any>(null);
  const [villageData, setVillageData] = useState<any>(null);
  const [umkmData, setUmkmData] = useState<any[]>([]);
  const [selectedUmkm, setSelectedUmkm] = useState<any | null>(null);
  const [selectedDesa, setSelectedDesa] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pre-compute desa for each UMKM using point-in-polygon
  const umkmWithDesa = useMemo(() => {
    if (!umkmData.length || !villageData?.features) return umkmData;
    return umkmData.map((umkm) => {
      if (!umkm.latitude || !umkm.longitude) return { ...umkm, _desa: null };
      const point = [umkm.longitude, umkm.latitude];
      for (const feature of villageData.features) {
        try {
          if (booleanPointInPolygon(point, feature.geometry)) {
            return { ...umkm, _desa: feature.properties?.village || null };
          }
        } catch {
          continue;
        }
      }
      return { ...umkm, _desa: null };
    });
  }, [umkmData, villageData]);

  useEffect(() => {
    // Fetch GeoJSON Kecamatan (boundaries)
    fetch('/geojson/banyumas-kecamatan.geojson?v=2')
      .then(res => res.json())
      .then(data => setGeoJsonData(data))
      .catch(err => console.error("Error loading GeoJSON Kecamatan:", err));

    // Fetch GeoJSON Outline (solid base for entire Banyumas)
    fetch('/geojson/banyumas-outline.geojson?v=2')
      .then(res => res.json())
      .then(data => setOutlineData(data))
      .catch(err => console.error("Error loading GeoJSON Outline:", err));

    // Fetch GeoJSON Mask (Spotlight effect)
    fetch('/geojson/banyumas-mask.geojson?v=2')
      .then(res => res.json())
      .then(data => setMaskData(data))
      .catch(err => console.error("Error loading GeoJSON Mask:", err));

    // Fetch GeoJSON Desa Baturaden (detail village boundaries)
    fetch('/geojson/baturaden-desa.geojson?v=1')
      .then(res => res.json())
      .then(data => setVillageData(data))
      .catch(err => console.error("Error loading GeoJSON Desa Baturaden:", err));

    // Fetch UMKM Data
    const fetchUmkm = async () => {
      setIsLoading(true);
      const supabase = createClient();
      
      // Try full query with relations
      const { data, error } = await supabase
        .from('umkm')
        .select(`
          *,
          kategori_umkm(nama),
          umkm_photos(cloudinary_url),
          menu_items(*),
          reviews(*)
        `)
        .eq('status_verifikasi', 'approved');
      
      if (error) {
        console.warn("Relational query failed (likely missing tables):", error.message);
        // Fallback to basic query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('umkm')
          .select(`
            *,
            kategori_umkm(nama),
            umkm_photos(cloudinary_url)
          `)
          .eq('status_verifikasi', 'approved');
          
        if (!fallbackError && fallbackData) {
          setUmkmData(fallbackData);
        }
      } else if (data) {
        setUmkmData(data);
      }
      setIsLoading(false);
    };

    fetchUmkm();
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-slate-50">
      <Navbar />

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Component */}
        <Sidebar 
          umkmList={umkmWithDesa} 
          selectedUmkm={selectedUmkm} 
          onSelectUmkm={setSelectedUmkm}
          selectedDesa={selectedDesa}
          onSelectDesa={setSelectedDesa}
          isLoading={isLoading}
        />

        {/* Map Area */}
        <div className="flex-1 relative bg-slate-100">
          <BanyumasMap 
            geoJsonData={geoJsonData} 
            outlineData={outlineData}
            maskData={maskData}
            villageData={villageData}
            umkmData={umkmWithDesa} 
            selectedUmkm={selectedUmkm}
            onSelectUmkm={setSelectedUmkm}
            selectedDesa={selectedDesa}
            onSelectDesa={setSelectedDesa}
          />
        </div>
      </main>
    </div>
  );
}
