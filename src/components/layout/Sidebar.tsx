'use client';

import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Phone, Info, X, ChevronLeft, Store, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  umkmList: any[];
  selectedUmkm: any | null;
  onSelectUmkm: (umkm: any | null) => void;
  isLoading: boolean;
}

export default function Sidebar({ umkmList, selectedUmkm, onSelectUmkm, isLoading }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredList = umkmList.filter(item => 
    item.nama_umkm.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.kategori_umkm?.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white border-r shadow-xl relative z-20 w-[380px] shrink-0">
      {/* Header Search Area */}
      <div className="p-4 space-y-4 border-b bg-white sticky top-0 z-30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Cari UMKM di Purbalingga..." 
            className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Button variant="outline" size="sm" className="rounded-full h-8 px-3 text-xs gap-1 border-slate-200">
            <Filter className="w-3 h-3" /> Filter
          </Button>
          <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200 h-8 px-3 rounded-full text-xs font-normal bg-slate-100 text-slate-700">Kuliner</Badge>
          <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200 h-8 px-3 rounded-full text-xs font-normal bg-slate-100 text-slate-700">Kerajinan</Badge>
          <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200 h-8 px-3 rounded-full text-xs font-normal bg-slate-100 text-slate-700">Fashion</Badge>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {/* List View */}
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              <div className="px-2 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Hasil Pencarian ({filteredList.length})
              </div>
              {filteredList.map((umkm) => (
                <div 
                  key={umkm.id} 
                  className={`p-3 rounded-xl cursor-pointer transition-all hover:bg-blue-50 group border border-transparent ${selectedUmkm?.id === umkm.id ? 'bg-blue-50 border-blue-100 shadow-sm' : ''}`}
                  onClick={() => onSelectUmkm(umkm)}
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                      {umkm.umkm_photos?.[0]?.cloudinary_url ? (
                        <img src={umkm.umkm_photos[0].cloudinary_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Store className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">{umkm.nama_umkm}</h3>
                      <p className="text-xs text-slate-500 mb-1">{umkm.kategori_umkm?.nama}</p>
                      <div className="flex items-center text-[11px] text-slate-400">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="truncate">{umkm.alamat}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Detail Panel Overlay */}
        {selectedUmkm && (
          <div className="absolute inset-0 bg-white z-40 transition-transform duration-300 transform translate-x-0">
            <div className="flex flex-col h-full">
              <div className="relative h-56 shrink-0">
                {selectedUmkm.umkm_photos?.[0]?.cloudinary_url ? (
                  <img src={selectedUmkm.umkm_photos[0].cloudinary_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                    <Store className="w-12 h-12 text-slate-400" />
                  </div>
                )}
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute top-4 left-4 rounded-full shadow-lg bg-white/90 hover:bg-white"
                  onClick={() => onSelectUmkm(null)}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">{selectedUmkm.nama_umkm}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">{selectedUmkm.kategori_umkm?.nama}</Badge>
                      <span className="text-sm text-slate-400">• Purbalingga</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 h-11" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedUmkm.latitude},${selectedUmkm.longitude}`, '_blank')}>
                      <MapPin className="w-4 h-4" /> Rute
                    </Button>
                    {selectedUmkm.whatsapp && (
                      <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 rounded-xl gap-2 h-11" onClick={() => window.open(`https://wa.me/${selectedUmkm.whatsapp}`, '_blank')}>
                        <Phone className="w-4 h-4" /> WhatsApp
                      </Button>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Alamat</p>
                        <p className="text-sm text-slate-600 mt-0.5">{selectedUmkm.alamat}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Tentang Usaha</p>
                        <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{selectedUmkm.deskripsi}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />
                  
                  <div>
                    <p className="text-xs text-slate-400">Terdaftar pada: {new Date(selectedUmkm.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
