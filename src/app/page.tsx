'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const PurbalinggaMap = dynamic(() => import('@/components/map/PurbalinggaMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Memuat Peta...</div>
});
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Menu } from 'lucide-react';

export default function Home() {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [umkmData, setUmkmData] = useState<any[]>([]);
  const [selectedUmkm, setSelectedUmkm] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch GeoJSON
    fetch('/geojson/purbalingga-kecamatan.geojson')
      .then(res => res.json())
      .then(data => setGeoJsonData(data))
      .catch(err => console.error("Error loading GeoJSON:", err));

    // Fetch UMKM Data — supabase dibuat di dalam effect agar tidak jadi dependency
    const fetchUmkm = async () => {
      setIsLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('umkm')
        .select(`
          *,
          kategori_umkm(nama),
          umkm_photos(cloudinary_url)
        `)
        .eq('status_verifikasi', 'approved');
      
      if (!error && data) {
        setUmkmData(data);
      }
      setIsLoading(false);
    };

    fetchUmkm();
  }, []); // ✅ Empty array: hanya jalan sekali saat mount

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <Navbar />

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Component */}
        <Sidebar 
          umkmList={umkmData} 
          selectedUmkm={selectedUmkm} 
          onSelectUmkm={setSelectedUmkm} 
          isLoading={isLoading}
        />

        {/* Map Area */}
        <div className="flex-1 relative bg-slate-100">
          <PurbalinggaMap 
            geoJsonData={geoJsonData} 
            umkmData={umkmData} 
            selectedUmkm={selectedUmkm}
            onSelectUmkm={setSelectedUmkm}
          />
        </div>
      </main>
    </div>
  );
}
