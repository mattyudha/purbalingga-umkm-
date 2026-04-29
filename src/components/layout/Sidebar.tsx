'use client';

import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Phone, Info, ChevronLeft, Store, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Globe, Clock, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  umkmList: any[];
  selectedUmkm: any | null;
  onSelectUmkm: (umkm: any | null) => void;
  isLoading: boolean;
}

function ImageCarousel({ photos, name }: { photos: any[], name: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-300 gap-3">
        <Store className="w-16 h-16 stroke-[1]" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Media Tidak Tersedia</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group overflow-hidden bg-slate-900">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={photos[currentIndex].cloudinary_url}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full object-cover opacity-90"
          alt={name}
        />
      </AnimatePresence>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      
      {photos.length > 1 && (
        <>
          <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2 z-10">
            {photos.map((_, idx) => (
              <button
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-8' : 'bg-white/30 w-3'}`}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
              />
            ))}
          </div>
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-black"
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((currentIndex - 1 + photos.length) % photos.length); }}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-black"
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((currentIndex + 1) % photos.length); }}
          >
            <ChevronLeft size={20} className="rotate-180" />
          </button>
        </>
      )}
    </div>
  );
}

export default function Sidebar({ umkmList, selectedUmkm, onSelectUmkm, isLoading }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'reviews' | 'about'>('overview');

  const categories = Array.from(new Set(umkmList.map(item => item.kategori_umkm?.nama).filter(Boolean)));

  const filteredList = umkmList.filter(item => {
    const matchesSearch = item.nama_umkm.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.kategori_umkm?.nama?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? item.kategori_umkm?.nama === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50/80 border-r border-slate-200/60 shadow-[0_0_80px_rgba(0,0,0,0.03)] relative z-20 w-[420px] shrink-0 overflow-hidden">
      {/* Search & Filter Header (Removed Logo for redundancy) */}
      <div className="p-7 pb-5 space-y-6 bg-white/70 backdrop-blur-2xl sticky top-0 z-30 border-b border-slate-200/50 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-sm font-heading font-black text-slate-900 tracking-widest uppercase">Eksplorasi UMKM</h2>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider mt-1">Ditemukan {filteredList.length} lokasi unggulan</p>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100/50 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest">Active GIS</span>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          </div>
          <Input 
            placeholder="Cari produk atau nama UMKM..." 
            className="pl-11 h-14 bg-white/50 border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-8 focus:ring-blue-600/5 transition-all rounded-[20px] text-sm font-semibold placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar mask-fade-right">
          <Button 
            variant={selectedCategory === null ? "default" : "outline"} 
            size="sm" 
            className={`rounded-2xl h-11 px-6 text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${selectedCategory === null ? 'bg-slate-900 hover:bg-blue-600 text-white shadow-xl shadow-slate-900/20' : 'bg-white/50 text-slate-500 hover:bg-white border-slate-200'}`}
            onClick={() => setSelectedCategory(null)}
          >
            <Filter className="w-3.5 h-3.5 mr-2" /> Semua
          </Button>
          {categories.map((cat: any) => (
            <Button 
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"} 
              size="sm"
              className={`rounded-2xl h-11 px-6 text-[11px] font-black uppercase tracking-widest shrink-0 transition-all duration-300 ${selectedCategory === cat ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20' : 'bg-white/50 text-slate-500 hover:bg-white border-slate-200'}`}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-5 pb-10 space-y-3">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-white/50 animate-pulse rounded-3xl border border-slate-100" />
              ))
            ) : (
              <>
                {filteredList.map((umkm) => (
                  <motion.div 
                    layout
                    key={umkm.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-[28px] cursor-pointer transition-all duration-500 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/60 group border-2 ${selectedUmkm?.id === umkm.id ? 'bg-white border-blue-600 shadow-2xl shadow-blue-500/10 scale-[1.02]' : 'bg-white/40 border-transparent'}`}
                    onClick={() => {
                      onSelectUmkm(umkm);
                      setActiveTab('overview');
                    }}
                  >
                    <div className="flex gap-5">
                      <div className="relative w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
                        {umkm.umkm_photos?.[0]?.cloudinary_url ? (
                          <img 
                            src={umkm.umkm_photos[0].cloudinary_url} 
                            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-125" 
                            alt="" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Store size={32} strokeWidth={1} />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-lg">
                            <ShieldCheck size={12} className="text-blue-600" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50/50 px-2.5 py-1 rounded-md border border-blue-100/30 leading-none">
                            {umkm.kategori_umkm?.nama}
                          </span>
                        </div>
                        <h3 className="font-heading font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight text-lg mb-1 truncate">
                          {umkm.nama_umkm}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2 italic">
                          {umkm.deskripsi}
                        </p>
                        <div className="flex items-center text-[10px] text-slate-400 font-semibold">
                          <MapPin className="w-3 h-3 mr-1.5 text-blue-400 shrink-0" />
                          <span className="truncate">{umkm.alamat}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Enterprise Detail Overlay */}
        <AnimatePresence>
          {selectedUmkm && (
            <motion.div 
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 250 }}
              className="absolute inset-0 bg-white z-40 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.05)] overflow-hidden"
            >
              {/* Header Image & Back Button */}
              <div className="relative h-64 shrink-0 z-10">
                <ImageCarousel photos={selectedUmkm.umkm_photos} name={selectedUmkm.nama_umkm} />
                <div className="absolute top-6 left-6 flex items-center gap-3">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="rounded-full shadow-2xl bg-white/95 backdrop-blur-md hover:bg-white text-slate-900 border-none w-10 h-10 transition-all active:scale-90"
                    onClick={() => onSelectUmkm(null)}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                </div>
                <div className="absolute top-6 right-6">
                  <div className="bg-white/95 backdrop-blur-md p-2 rounded-full shadow-2xl">
                    <CheckCircle2 size={20} className="text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Title & Info Section */}
              <div className="px-6 py-5 bg-white border-b border-slate-100">
                <h2 className="text-2xl font-heading font-black text-slate-900 tracking-tight leading-tight mb-2">{selectedUmkm.nama_umkm}</h2>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold text-amber-500">{selectedUmkm.rating_avg || 4.5}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <span key={i} className={`text-sm ${i <= Math.floor(selectedUmkm.rating_avg || 4.5) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-400">({selectedUmkm.review_count || 0}) • {selectedUmkm.price_range || 'Rp 10.000 - Rp 50.000'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span className="text-blue-600">{selectedUmkm.kategori_umkm?.nama}</span>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <Globe size={12} /> Terbuka untuk umum
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex justify-between px-6 py-4 border-b border-slate-50">
                {[
                  { icon: <MapPin />, label: 'Rute', action: () => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedUmkm.latitude},${selectedUmkm.longitude}`, '_blank') },
                  { icon: <ShieldCheck />, label: 'Simpan', action: () => {} },
                  { icon: <Globe />, label: 'Sekitar', action: () => {} },
                  { icon: <Phone />, label: 'Hubungi', action: () => selectedUmkm.whatsapp && window.open(`https://wa.me/${selectedUmkm.whatsapp}`, '_blank') },
                  { icon: <Info />, label: 'Bagikan', action: () => {} }
                ].map((btn, idx) => (
                  <button key={idx} onClick={btn.action} className="flex flex-col items-center gap-1.5 group">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center transition-all group-hover:bg-blue-600 group-hover:text-white group-active:scale-90 shadow-sm border border-blue-100/50">
                      {React.cloneElement(btn.icon as React.ReactElement, { size: 18 })}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-blue-600">{btn.label}</span>
                  </button>
                ))}
              </div>

              {/* Tabs Navigation */}
              <div className="flex px-6 border-b border-slate-100 overflow-x-auto no-scrollbar bg-white">
                {['overview', 'menu', 'reviews', 'about'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`py-4 px-4 text-xs font-black uppercase tracking-widest relative whitespace-nowrap transition-colors ${activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="activeTabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <ScrollArea className="flex-1">
                <div className="p-6">
                  {activeTab === 'overview' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
                        <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                        <div className="space-y-1">
                           <p className="text-sm font-bold text-emerald-800">Dine-in • Takeaway • Delivery</p>
                           <p className="text-xs text-emerald-600/80 font-semibold">Tersedia untuk semua layanan hari ini</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex gap-4">
                          <MapPin className="text-blue-600 shrink-0" size={20} />
                          <p className="text-sm font-semibold text-slate-700 leading-relaxed">{selectedUmkm.alamat}</p>
                        </div>
                        <div className="flex gap-4 items-center">
                          <Clock className="text-blue-600 shrink-0" size={20} />
                          <div>
                            <p className="text-sm font-bold text-amber-600">Akan Tutup • {selectedUmkm.jam_operasional?.tutup || '16:00'}</p>
                            <p className="text-xs font-semibold text-slate-400">{selectedUmkm.jam_operasional?.hari || 'Senin - Minggu'}</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <Store className="text-blue-600 shrink-0" size={20} />
                          <p className="text-sm font-semibold text-slate-700">{selectedUmkm.price_range || 'Rp 10.000 - Rp 50.000'} per orang</p>
                        </div>
                        <div className="flex gap-4">
                          <Phone className="text-blue-600 shrink-0" size={20} />
                          <p className="text-sm font-semibold text-slate-700">{selectedUmkm.whatsapp || '-'}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'menu' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      {selectedUmkm.menu_items && selectedUmkm.menu_items.length > 0 ? (
                        selectedUmkm.menu_items.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                            <div>
                              <h4 className="font-bold text-slate-900">{item.nama}</h4>
                              <p className="text-xs text-slate-500 mt-1">{item.deskripsi}</p>
                            </div>
                            <span className="text-sm font-black text-blue-600">Rp {item.harga?.toLocaleString()}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-sm font-bold text-slate-400">Menu belum tersedia</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'reviews' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                       {selectedUmkm.reviews && selectedUmkm.reviews.length > 0 ? (
                         selectedUmkm.reviews.map((rev: any) => (
                           <div key={rev.id} className="p-4 rounded-2xl border border-slate-100">
                             <div className="flex justify-between items-center mb-2">
                               <h4 className="text-sm font-black text-slate-900">{rev.user_name}</h4>
                               <div className="flex gap-0.5">
                                  {[1,2,3,4,5].map(i => (
                                    <span key={i} className={`text-[10px] ${i <= rev.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                                  ))}
                               </div>
                             </div>
                             <p className="text-xs text-slate-600 leading-relaxed font-medium">"{rev.comment}"</p>
                             <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase">{new Date(rev.created_at).toLocaleDateString()}</p>
                           </div>
                         ))
                       ) : (
                         <div className="text-center py-10">
                           <p className="text-sm font-bold text-slate-400">Belum ada ulasan</p>
                         </div>
                       )}
                    </motion.div>
                  )}

                  {activeTab === 'about' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="p-6 rounded-[32px] bg-slate-900 text-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-5 relative">
                          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xl border border-white/10">
                             <Store size={32} className="text-blue-400" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">Pemilik Usaha</span>
                            <h4 className="text-xl font-bold">{selectedUmkm.nama_pemilik}</h4>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4 px-2">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Tentang Kami</h4>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed">
                          {selectedUmkm.deskripsi}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {/* Suggest Edit Footer */}
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
                 <Button variant="outline" size="sm" className="rounded-full h-10 px-6 gap-2 bg-white text-blue-600 border-blue-100 shadow-sm hover:bg-blue-50">
                    <ShieldCheck size={14} /> Berikan Masukan
                 </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
