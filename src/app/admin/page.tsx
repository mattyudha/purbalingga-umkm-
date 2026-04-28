'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, CheckCircle, XCircle, MapPin, Eye, 
  Users, Store, Clock, ShieldCheck, ArrowRight, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [umkmList, setUmkmList] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []); // ✅ Empty array: hanya jalan sekali saat mount

  const fetchData = async () => {
    setIsLoading(true);
    // Supabase client dibuat di dalam fungsi, bukan di level komponen
    const supabase = createClient();
    
    // Fetch stats
    const { data: allUmkm } = await supabase.from('umkm').select('status_verifikasi');
    if (allUmkm) {
      setStats({
        total: allUmkm.length,
        pending: allUmkm.filter(x => x.status_verifikasi === 'pending').length,
        approved: allUmkm.filter(x => x.status_verifikasi === 'approved').length
      });
    }

    // Fetch pending
    const { data: pending, error } = await supabase
      .from('umkm')
      .select(`
        *,
        kategori_umkm(nama),
        kecamatan(nama_kecamatan),
        umkm_photos(cloudinary_url)
      `)
      .eq('status_verifikasi', 'pending')
      .order('created_at', { ascending: false });

    if (!error && pending) {
      setUmkmList(pending);
    }
    setIsLoading(false);
  };

  const handleVerifikasi = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    const supabase = createClient();
    const { error } = await supabase
      .from('umkm')
      .update({ status_verifikasi: status })
      .eq('id', id);

    if (!error) {
      setUmkmList(prev => prev.filter(item => item.id !== id));
      // Update local stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        approved: status === 'approved' ? prev.approved + 1 : prev.approved
      }));
    } else {
      alert("Gagal memverifikasi: " + error.message);
    }
    setProcessingId(null);
  };

  const statCards = [
    { title: 'Total UMKM', value: stats.total, icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Menunggu Verifikasi', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Telah Disetujui', value: stats.approved, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-slate-500 font-medium animate-pulse">Memuat data panel admin...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider mb-2">
                <ShieldCheck size={18} />
                <span>Panel Administrasi</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard Admin</h1>
              <p className="text-slate-500 mt-1">Kelola dan verifikasi data UMKM Kabupaten Purbalingga.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/">
                <Button variant="outline" className="rounded-xl border-slate-200 bg-white">
                  <ArrowRight size={18} className="mr-2 rotate-180" /> Kembali
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl`}>
                        <stat.icon size={24} />
                      </div>
                      <span className="text-3xl font-black text-slate-900">{stat.value}</span>
                    </div>
                    <p className="text-slate-500 font-semibold mt-4">{stat.title}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Pending List Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Antrean Verifikasi
                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{umkmList.length}</span>
              </h2>
            </div>

            <AnimatePresence mode="popLayout">
              {umkmList.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Card className="border-0 shadow-sm rounded-2xl bg-white/50 backdrop-blur-sm border-dashed border-2 border-slate-200">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Semua Terverifikasi</h3>
                      <p className="text-slate-500 max-w-xs mt-2">Tidak ada pengajuan UMKM yang menunggu persetujuan saat ini.</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {umkmList.map((umkm, i) => (
                    <motion.div
                      key={umkm.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white hover:shadow-md transition-all group">
                        <div className="flex flex-col lg:flex-row">
                          {/* Image Section */}
                          <div className="lg:w-1/4 h-56 lg:h-auto bg-slate-100 relative overflow-hidden">
                            {umkm.umkm_photos?.[0]?.cloudinary_url ? (
                              <img 
                                src={umkm.umkm_photos[0].cloudinary_url} 
                                alt={umkm.nama_umkm} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                <Store size={32} strokeWidth={1.5} />
                                <span className="text-xs font-medium italic">Tidak ada foto</span>
                              </div>
                            )}
                            <div className="absolute top-3 left-3">
                              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-lg shadow-amber-500/20">
                                Pending
                              </span>
                            </div>
                          </div>
                          
                          {/* Content Section */}
                          <div className="p-6 lg:w-3/4 flex flex-col justify-between">
                            <div className="space-y-4">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                                <div>
                                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{umkm.nama_umkm}</h3>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">{umkm.kategori_umkm?.nama}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-sm text-slate-500 font-medium flex items-center gap-1">
                                      <MapPin size={14} /> {umkm.kecamatan?.nama_kecamatan}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diajukan Pada</p>
                                  <p className="text-sm font-semibold text-slate-700">{new Date(umkm.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="space-y-2">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pemilik Usaha</span>
                                    <span className="text-sm font-bold text-slate-800">{umkm.nama_pemilik}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kontak WhatsApp</span>
                                    <span className="text-sm font-bold text-slate-800">+{umkm.whatsapp}</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alamat Lengkap</span>
                                    <span className="text-sm font-medium text-slate-600 line-clamp-2">{umkm.alamat}</span>
                                  </div>
                                  <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${umkm.latitude},${umkm.longitude}`}
                                    target="_blank"
                                    className="text-blue-600 hover:text-blue-700 transition-colors text-xs font-bold inline-flex items-center gap-1 mt-1"
                                  >
                                    <ExternalLink size={12} /> Lihat di Google Maps
                                  </a>
                                </div>
                              </div>
                              
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Deskripsi Usaha</span>
                                <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 italic">"{umkm.deskripsi}"</p>
                              </div>
                            </div>

                            <div className="mt-8 flex justify-end items-center gap-3 border-t border-slate-100 pt-5">
                              <Button 
                                variant="ghost" 
                                className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl px-6 h-11 font-bold transition-all"
                                onClick={() => handleVerifikasi(umkm.id, 'rejected')}
                                disabled={processingId === umkm.id}
                              >
                                {processingId === umkm.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                                Tolak Pengajuan
                              </Button>
                              <Button 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 h-11 font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95"
                                onClick={() => handleVerifikasi(umkm.id, 'approved')}
                                disabled={processingId === umkm.id}
                              >
                                {processingId === umkm.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                Setujui & Publish
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="py-8 px-4 border-t bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-slate-400 font-medium italic">
            Sistem Informasi Geografis UMKM Purbalingga © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
