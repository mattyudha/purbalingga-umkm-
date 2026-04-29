'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Loader2, CheckCircle, XCircle, MapPin, Eye, 
  Users, Store, Clock, ShieldCheck, ArrowRight, ExternalLink,
  Search, Trash2, Edit, Plus
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import UMKMFormModal from '@/components/dashboard/UMKMFormModal';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'stats' | 'verification' | 'catalog'>('stats');
  const [umkmList, setUmkmList] = useState<any[]>([]);
  const [allUmkmList, setAllUmkmList] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUmkmForEdit, setSelectedUmkmForEdit] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const supabase = createClient();
    
    // Check session & profile role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!['super_admin', 'admin_dinas'].includes(profile?.role || '')) {
      router.push('/dashboard');
      return;
    }

    // Fetch stats
    const { data: allUmkmData } = await supabase.from('umkm').select('status_verifikasi');
    if (allUmkmData) {
      setStats({
        total: allUmkmData.length,
        pending: allUmkmData.filter(x => x.status_verifikasi === 'pending').length,
        approved: allUmkmData.filter(x => x.status_verifikasi === 'approved').length
      });
    }

    // Fetch all UMKMs for catalog
    const { data: catalog, error: catError } = await supabase
      .from('umkm')
      .select(`
        *,
        kategori_umkm(nama),
        kecamatan(nama_kecamatan),
        umkm_photos(cloudinary_url)
      `)
      .order('created_at', { ascending: false });

    if (!catError && catalog) {
      setAllUmkmList(catalog);
      setUmkmList(catalog.filter(u => u.status_verifikasi === 'pending'));
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

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus UMKM ini secara permanen?")) return;
    
    setProcessingId(id);
    const supabase = createClient();
    const { error } = await supabase.from('umkm').delete().eq('id', id);

    if (!error) {
      setAllUmkmList(prev => prev.filter(item => item.id !== id));
      setUmkmList(prev => prev.filter(item => item.id !== id));
      // Update stats
      setStats(prev => ({ ...prev, total: prev.total - 1 }));
    } else {
      alert("Gagal menghapus: " + error.message);
    }
    setProcessingId(null);
  };

  const filteredCatalog = allUmkmList.filter(item => 
    item.nama_umkm.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.nama_pemilik.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight">Dashboard Admin</h1>
              <p className="text-slate-500 mt-1">Kelola dan verifikasi data UMKM Kabupaten Purbalingga.</p>
            </div>
            <div className="flex gap-3">
               <Button 
                 className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-11 font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
                 onClick={() => {
                   setSelectedUmkmForEdit(null);
                   setIsModalOpen(true);
                 }}
               >
                 <Plus className="w-4 h-4 mr-2" /> Tambah UMKM Baru
               </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200">
             {[
               { id: 'stats', label: 'Ringkasan', icon: <Users size={16} /> },
               { id: 'verification', label: 'Verifikasi', icon: <Clock size={16} />, badge: stats.pending },
               { id: 'catalog', label: 'Katalog UMKM', icon: <Store size={16} /> },
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 {tab.icon}
                 {tab.label}
                 {tab.badge !== undefined && tab.badge > 0 && (
                   <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-full">
                     {tab.badge}
                   </span>
                 )}
                 {activeTab === tab.id && (
                   <motion.div layoutId="adminTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                 )}
               </button>
             ))}
          </div>

          {activeTab === 'stats' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* Stats Grid */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {statCards.map((stat, i) => (
                   <Card key={stat.title} className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
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
                 ))}
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="border-0 shadow-sm rounded-3xl p-8 bg-white">
                    <h3 className="text-lg font-black text-slate-900 mb-6">Aktivitas Terakhir</h3>
                    <div className="space-y-6">
                       {allUmkmList.slice(0, 5).map((u, i) => (
                         <div key={u.id} className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden">
                               {u.umkm_photos?.[0]?.cloudinary_url ? (
                                 <img src={u.umkm_photos[0].cloudinary_url} className="w-full h-full object-cover" alt="" />
                               ) : <Store className="text-slate-300" size={20} />}
                            </div>
                            <div className="flex-1">
                               <p className="text-sm font-bold text-slate-900">{u.nama_umkm}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(u.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${u.status_verifikasi === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                               {u.status_verifikasi}
                            </div>
                         </div>
                       ))}
                    </div>
                  </Card>
                  
                   <Card className="border-0 shadow-sm rounded-3xl p-8 bg-white overflow-hidden relative">
                     <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                           <h3 className="text-lg font-black text-slate-900">Distribusi Sektor UMKM</h3>
                           <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                              <Store size={18} />
                           </div>
                        </div>
                        
                        <div className="space-y-5">
                           {Object.entries(
                             allUmkmList.reduce((acc: any, u) => {
                               const cat = u.kategori_umkm?.nama || 'Lainnya';
                               acc[cat] = (acc[cat] || 0) + 1;
                               return acc;
                             }, {})
                           ).sort((a: any, b: any) => b[1] - a[1]).slice(0, 4).map(([cat, count]: any, i) => {
                             const percentage = Math.round((count / allUmkmList.length) * 100);
                             const colors = ['bg-blue-600', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500'];
                             return (
                               <div key={cat} className="space-y-2">
                                 <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                                   <span className="text-slate-600">{cat}</span>
                                   <span className="text-slate-900">{count} UMKM ({percentage}%)</span>
                                 </div>
                                 <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                   <motion.div 
                                     initial={{ width: 0 }}
                                     animate={{ width: `${percentage}%` }}
                                     transition={{ duration: 1, delay: i * 0.1 }}
                                     className={`h-full ${colors[i % colors.length]} rounded-full shadow-sm`}
                                   />
                                 </div>
                               </div>
                             );
                           })}
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-slate-50">
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Sistem Informasi Geografis Purbalingga</p>
                        </div>
                     </div>
                   </Card>
               </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  Antrean Verifikasi
                  <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{umkmList.length}</span>
                </h2>
              </div>

              <AnimatePresence mode="popLayout">
                {umkmList.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                    {umkmList.map((umkm) => (
                      <motion.div
                        key={umkm.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        {/* UMKM CARD Logic (Reuse the existing card UI) */}
                        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white hover:shadow-md transition-all group">
                          <div className="flex flex-col lg:flex-row">
                            <div className="lg:w-1/4 h-56 lg:h-auto bg-slate-100 relative overflow-hidden">
                              {umkm.umkm_photos?.[0]?.cloudinary_url ? (
                                <img src={umkm.umkm_photos[0].cloudinary_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : <div className="flex items-center justify-center h-full text-slate-400"><Store size={32} /></div>}
                            </div>
                            <div className="p-6 lg:w-3/4 flex flex-col justify-between">
                              <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="text-2xl font-bold text-slate-900">{umkm.nama_umkm}</h3>
                                    <p className="text-sm font-bold text-blue-600 mt-1">{umkm.kategori_umkm?.nama} • {umkm.kecamatan?.nama_kecamatan}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Diajukan</p>
                                    <p className="text-sm font-semibold">{new Date(umkm.created_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-600 line-clamp-2 italic">"{umkm.deskripsi}"</p>
                                <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                                   <div className="flex flex-col"><span className="text-[10px] uppercase text-slate-400">Pemilik</span>{umkm.nama_pemilik}</div>
                                   <div className="flex flex-col"><span className="text-[10px] uppercase text-slate-400">WhatsApp</span>{umkm.whatsapp}</div>
                                </div>
                              </div>
                              <div className="mt-8 flex justify-end gap-3 border-t pt-5">
                                <Button variant="ghost" className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl px-6 h-11 font-bold" onClick={() => handleVerifikasi(umkm.id, 'rejected')} disabled={processingId === umkm.id}>
                                  <XCircle className="w-4 h-4 mr-2" /> Tolak
                                </Button>
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 h-11 font-bold shadow-lg shadow-emerald-100" onClick={() => handleVerifikasi(umkm.id, 'approved')} disabled={processingId === umkm.id}>
                                  <CheckCircle className="w-4 h-4 mr-2" /> Setujui
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
          )}

          {activeTab === 'catalog' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <Input 
                      placeholder="Cari nama UMKM atau pemilik..." 
                      className="pl-12 h-12 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 transition-all font-medium"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-sm font-bold text-slate-400">Menampilkan {filteredCatalog.length} UMKM</span>
                  </div>
               </div>

               <Card className="border-0 shadow-sm rounded-[32px] overflow-hidden bg-white border border-slate-100/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100">
                             <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400">UMKM & Pemilik</th>
                             <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Kategori</th>
                             <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                             <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Tanggal Gabung</th>
                             <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Aksi</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {filteredCatalog.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                               <td className="p-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                        {u.umkm_photos?.[0]?.cloudinary_url ? (
                                          <img src={u.umkm_photos[0].cloudinary_url} className="w-full h-full object-cover" alt="" />
                                        ) : <div className="w-full h-full flex items-center justify-center"><Store size={20} className="text-slate-300" /></div>}
                                     </div>
                                     <div className="flex flex-col">
                                        <span className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{u.nama_umkm}</span>
                                        <span className="text-xs font-bold text-slate-400">{u.nama_pemilik}</span>
                                     </div>
                                  </div>
                               </td>
                               <td className="p-6">
                                  <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                                     {u.kategori_umkm?.nama}
                                  </span>
                               </td>
                               <td className="p-6">
                                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    u.status_verifikasi === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                                    u.status_verifikasi === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                     <div className={`w-1.5 h-1.5 rounded-full ${u.status_verifikasi === 'approved' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                                     {u.status_verifikasi}
                                  </div>
                               </td>
                               <td className="p-6">
                                  <span className="text-xs font-bold text-slate-500">{new Date(u.created_at).toLocaleDateString()}</span>
                               </td>
                               <td className="p-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                     <Button 
                                       variant="ghost" 
                                       size="icon" 
                                       className="w-9 h-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                                       onClick={() => {
                                         setSelectedUmkmForEdit(u);
                                         setIsModalOpen(true);
                                       }}
                                     >
                                        <Edit size={18} />
                                     </Button>
                                     <Button 
                                       variant="ghost" 
                                       size="icon" 
                                       className="w-9 h-9 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                                       onClick={() => handleDelete(u.id)}
                                     >
                                        <Trash2 size={18} />
                                     </Button>
                                  </div>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
               </Card>
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 px-4 border-t bg-white mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-slate-400 font-medium italic">
            Sistem Informasi Geografis UMKM Purbalingga © 2026
          </p>
        </div>
      </footer>

      <UMKMFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchData()} 
        editingUmkm={selectedUmkmForEdit}
      />
    </div>
  );
}
