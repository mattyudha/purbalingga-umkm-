'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X, MapPin, Store, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const MapPicker = dynamic(() => import('@/components/dashboard/MapPicker'), {
  ssr: false,
  loading: () => <div className="w-full h-[300px] bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 rounded-xl border border-dashed border-slate-200">Memuat Peta...</div>
});

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UMKMFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingUmkm?: any | null;
}

export default function UMKMFormModal({ isOpen, onClose, onSuccess, editingUmkm }: UMKMFormModalProps) {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Master Data
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [kecamatanList, setKecamatanList] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    nama_umkm: '',
    nama_pemilik: '',
    kategori_id: '',
    kecamatan_id: '',
    alamat: '',
    deskripsi: '',
    whatsapp: '',
    latitude: -7.33,
    longitude: 109.36,
    status_verifikasi: 'approved',
    price_range: '',
    jam_buka: '08:00',
    jam_tutup: '21:00'
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchMasterData() {
      const { data: catData } = await supabase.from('kategori_umkm').select('*').order('nama');
      if (catData) setKategoriList(catData);

      const { data: kecData } = await supabase.from('kecamatan').select('*').order('nama_kecamatan');
      if (kecData) setKecamatanList(kecData);
    }
    fetchMasterData();
  }, [supabase]);

  useEffect(() => {
    if (editingUmkm) {
      setFormData({
        nama_umkm: editingUmkm.nama_umkm || '',
        nama_pemilik: editingUmkm.nama_pemilik || '',
        kategori_id: editingUmkm.kategori_id || '',
        kecamatan_id: editingUmkm.kecamatan_id || '',
        alamat: editingUmkm.alamat || '',
        deskripsi: editingUmkm.deskripsi || '',
        whatsapp: editingUmkm.whatsapp || '',
        latitude: editingUmkm.latitude || -7.33,
        longitude: editingUmkm.longitude || 109.36,
        status_verifikasi: editingUmkm.status_verifikasi || 'approved',
        price_range: editingUmkm.price_range || '',
        jam_buka: editingUmkm.jam_operasional?.buka || '08:00',
        jam_tutup: editingUmkm.jam_operasional?.tutup || '21:00'
      });
    } else {
      setFormData({
        nama_umkm: '',
        nama_pemilik: '',
        kategori_id: '',
        kecamatan_id: '',
        alamat: '',
        deskripsi: '',
        whatsapp: '',
        latitude: -7.33,
        longitude: 109.36,
        status_verifikasi: 'approved',
        price_range: 'Rp 10.000 - Rp 50.000',
        jam_buka: '08:00',
        jam_tutup: '21:00'
      });
    }
    setError(null);
  }, [editingUmkm, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Photo Upload (if new file)
      let photoUrl = editingUmkm?.umkm_photos?.[0]?.cloudinary_url || null;
      let publicId = editingUmkm?.umkm_photos?.[0]?.cloudinary_public_id || null;

      if (file) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
        
        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || "Gagal mengupload foto");
        }
        
        const photoData = await uploadRes.json();
        photoUrl = photoData.secure_url;
        publicId = photoData.public_id;
      }

      const jam_operasional = {
        buka: formData.jam_buka,
        tutup: formData.jam_tutup,
        hari: "Senin - Minggu"
      };

      const payload = {
        nama_umkm: formData.nama_umkm,
        nama_pemilik: formData.nama_pemilik,
        kategori_id: formData.kategori_id || null,
        kecamatan_id: formData.kecamatan_id || null,
        alamat: formData.alamat,
        deskripsi: formData.deskripsi,
        whatsapp: formData.whatsapp,
        latitude: formData.latitude,
        longitude: formData.longitude,
        status_verifikasi: formData.status_verifikasi,
        price_range: formData.price_range,
        jam_operasional
      };

      if (editingUmkm) {
        await supabase.from('umkm').update(payload).eq('id', editingUmkm.id);
        if (file && photoUrl) {
          const { data: existingPhotos } = await supabase.from('umkm_photos').select('id').eq('umkm_id', editingUmkm.id).limit(1);
          if (existingPhotos && existingPhotos.length > 0) {
            await supabase.from('umkm_photos').update({ cloudinary_url: photoUrl, cloudinary_public_id: publicId }).eq('id', existingPhotos[0].id);
          } else {
            await supabase.from('umkm_photos').insert({ umkm_id: editingUmkm.id, cloudinary_url: photoUrl, cloudinary_public_id: publicId, is_primary: true });
          }
        }
      } else {
        const { data: newUmkm } = await supabase.from('umkm').insert({ ...payload, owner_id: (await supabase.auth.getUser()).data.user?.id }).select().single();
        if (photoUrl && newUmkm) {
          await supabase.from('umkm_photos').insert({ umkm_id: newUmkm.id, cloudinary_url: photoUrl, cloudinary_public_id: publicId, is_primary: true });
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={false}>
      <DialogContent 
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target?.closest('[data-slot="select-content"]')) {
            e.preventDefault();
          }
        }}
        className="max-w-5xl h-[90vh] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
               {editingUmkm ? <ShieldCheck size={24} /> : <Store size={24} />}
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
                {editingUmkm ? 'Edit Data UMKM' : 'Tambah UMKM Baru'}
              </DialogTitle>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Administrative Control Panel</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-20">
            {/* Left Column: Basic Info */}
            <div className="space-y-8">
              <div className="space-y-6">
                 <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] border-b border-blue-50 pb-3 font-heading">Informasi Utama</h4>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Nama UMKM / Usaha</Label>
                      <Input 
                        required 
                        className="rounded-2xl border-slate-200 h-13 font-bold bg-slate-50/30"
                        value={formData.nama_umkm}
                        onChange={e => setFormData({...formData, nama_umkm: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Nama Pemilik</Label>
                      <Input 
                        required 
                        className="rounded-2xl border-slate-200 h-13 font-bold bg-slate-50/30"
                        value={formData.nama_pemilik}
                        onChange={e => setFormData({...formData, nama_pemilik: e.target.value})}
                      />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Kategori Sektor</Label>
                      <Select value={formData.kategori_id} onValueChange={val => setFormData({...formData, kategori_id: val})}>
                        <SelectTrigger type="button" className="rounded-2xl border-slate-200 h-13 font-bold bg-slate-50/30 focus:ring-blue-600/10 transition-all w-full">
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl z-[150]">
                          {kategoriList.map(cat => <SelectItem key={cat.id} value={cat.id} className="py-3">{cat.nama}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Kecamatan / Wilayah</Label>
                      <Select value={formData.kecamatan_id} onValueChange={val => setFormData({...formData, kecamatan_id: val})}>
                        <SelectTrigger type="button" className="rounded-2xl border-slate-200 h-13 font-bold bg-slate-50/30 focus:ring-blue-600/10 transition-all w-full">
                          <SelectValue placeholder="Pilih Kecamatan" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl z-[150]">
                          {kecamatanList.map(kec => <SelectItem key={kec.id} value={kec.id} className="py-3">{kec.nama_kecamatan}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">WhatsApp (628...)</Label>
                      <Input 
                        required 
                        className="rounded-2xl border-slate-200 h-13 font-bold bg-slate-50/30"
                        value={formData.whatsapp}
                        onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Status Verifikasi</Label>
                      <Select value={formData.status_verifikasi} onValueChange={val => setFormData({...formData, status_verifikasi: val})}>
                        <SelectTrigger type="button" className={cn(
                          "rounded-2xl border-slate-200 h-13 font-black bg-slate-50/30 transition-all",
                          formData.status_verifikasi === 'approved' && "text-emerald-600 bg-emerald-50/30 border-emerald-100",
                          formData.status_verifikasi === 'pending' && "text-amber-600 bg-amber-50/30 border-amber-100",
                          formData.status_verifikasi === 'rejected' && "text-red-600 bg-red-50/30 border-red-100"
                        )}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-2xl z-[150]">
                          <SelectItem value="approved" className="text-emerald-600 font-bold py-3">Approved / Published</SelectItem>
                          <SelectItem value="pending" className="text-amber-600 font-bold py-3">Pending Review</SelectItem>
                          <SelectItem value="rejected" className="text-red-600 font-bold py-3">Rejected / Cancel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Rentang Harga</Label>
                    <Input 
                      placeholder="Contoh: Rp 10.000 - Rp 50.000"
                      className="rounded-2xl border-slate-200 h-13 font-bold bg-slate-50/30"
                      value={formData.price_range}
                      onChange={e => setFormData({...formData, price_range: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Jam Buka</Label>
                      <Input type="time" className="rounded-2xl border-slate-200 h-13 font-bold" value={formData.jam_buka} onChange={e => setFormData({...formData, jam_buka: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Jam Tutup</Label>
                      <Input type="time" className="rounded-2xl border-slate-200 h-13 font-bold" value={formData.jam_tutup} onChange={e => setFormData({...formData, jam_tutup: e.target.value})} />
                    </div>
                 </div>

                 <div className="space-y-2">
                   <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Deskripsi Usaha</Label>
                   <Textarea 
                     required 
                     rows={4} 
                     className="rounded-3xl border-slate-200 font-medium leading-relaxed bg-slate-50/30"
                     value={formData.deskripsi}
                     onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                   />
                 </div>
              </div>
            </div>

            {/* Right Column: Photo & Map */}
            <div className="space-y-8">
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] border-b border-blue-50 pb-3 font-heading">Lokasi & Media</h4>
                  
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Alamat Lengkap</Label>
                    <Textarea 
                      required 
                      rows={2} 
                      className="rounded-2xl border-slate-200 font-medium bg-slate-50/30"
                      value={formData.alamat}
                      onChange={e => setFormData({...formData, alamat: e.target.value})}
                    />
                  </div>

                  <div className="space-y-4">
                     <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1 flex justify-between">
                       <span>Koordinat Presisi</span>
                       <span className="text-blue-600 font-black">{formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}</span>
                     </Label>
                     <div className="rounded-[2.5rem] border-2 border-slate-100 overflow-hidden shadow-inner h-[280px]">
                        <MapPicker 
                          key={editingUmkm?.id || 'new'}
                          initialLocation={editingUmkm ? [editingUmkm.latitude, editingUmkm.longitude] : undefined}
                          onLocationSelect={(lat, lng) => setFormData({...formData, latitude: lat, longitude: lng})} 
                        />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Foto Utama</Label>
                     <div className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 group transition-all hover:bg-white hover:shadow-xl">
                        <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-md flex items-center justify-center shrink-0">
                           {file ? (
                             <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                           ) : editingUmkm?.umkm_photos?.[0]?.cloudinary_url ? (
                             <img src={editingUmkm.umkm_photos[0].cloudinary_url} className="w-full h-full object-cover" alt="" />
                           ) : <Store className="text-slate-300" size={32} />}
                        </div>
                        <div className="flex-1 space-y-2">
                           <Input type="file" accept="image/*" className="hidden" id="admin-umkm-photo" onChange={e => setFile(e.target.files?.[0] || null)} />
                           <Button variant="outline" className="w-full rounded-2xl h-12 font-bold bg-white" type="button" onClick={() => document.getElementById('admin-umkm-photo')?.click()}>
                             Ganti Foto
                           </Button>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">Format: JPG, PNG • Max 5MB</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-slate-100 bg-white sticky bottom-0 z-20 flex flex-col md:flex-row items-center justify-between gap-4">
           {error && <p className="text-sm font-bold text-red-600 flex items-center gap-2"><X size={16} /> {error}</p>}
           <div className="flex gap-4 w-full md:w-auto ml-auto">
              <Button variant="ghost" onClick={onClose} className="rounded-2xl h-14 px-8 font-bold text-slate-500">
                 Batal
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-[1.25rem] h-14 px-12 font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95"
              >
                {isLoading ? <Loader2 className="mr-2 animate-spin" /> : (editingUmkm ? 'Simpan Perubahan' : 'Terbitkan UMKM')}
              </Button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
