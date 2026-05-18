'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dynamic from 'next/dynamic';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const MapPicker = dynamic(() => import('@/components/dashboard/MapPicker'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 rounded-lg">Memuat Peta Pilih Lokasi...</div>
});

export default function CreateUmkmPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Master Data
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [kecamatanList, setKecamatanList] = useState<any[]>([]);

  // Form State
  const [namaUmkm, setNamaUmkm] = useState('');
  const [namaPemilik, setNamaPemilik] = useState('');
  const [kategoriId, setKategoriId] = useState('');
  const [kecamatanId, setKecamatanId] = useState('');
  const [alamat, setAlamat] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!location) {
      setError("Silakan pilih lokasi UMKM Anda pada peta.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Get current user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Anda harus login terlebih dahulu");

      // 2. Upload image to Cloudinary if exists
      let photoData = null;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!uploadRes.ok) throw new Error("Gagal mengupload foto");
        photoData = await uploadRes.json();
      }

      // 3. Insert into UMKM table
      const { data: umkmData, error: umkmError } = await supabase.from('umkm').insert({
        owner_id: user.id,
        nama_umkm: namaUmkm,
        nama_pemilik: namaPemilik,
        kategori_id: kategoriId,
        kecamatan_id: kecamatanId,
        alamat: alamat,
        deskripsi: deskripsi,
        whatsapp: whatsapp,
        latitude: location.lat,
        longitude: location.lng,
        status_verifikasi: 'pending' // explicit, though it's default
      }).select().single();

      if (umkmError) throw umkmError;

      // 4. Insert into umkm_photos table if photo uploaded
      if (photoData && umkmData) {
        const { error: photoError } = await supabase.from('umkm_photos').insert({
          umkm_id: umkmData.id,
          cloudinary_url: photoData.secure_url,
          cloudinary_public_id: photoData.public_id,
          is_primary: true
        });

        if (photoError) console.error("Error inserting photo record:", photoError);
      }

      // Success! Show popup
      setShowSuccess(true);

    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:underline mb-6">
          <ArrowLeft size={16} className="mr-1" /> Kembali ke Dashboard
        </Link>
        
        <Card className="shadow-lg border-0 ring-1 ring-slate-200">
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-2xl font-bold">Daftarkan UMKM Baru</CardTitle>
            <CardDescription>
              Isi formulir di bawah ini dengan lengkap. Data Anda akan ditinjau oleh tim sebelum tampil di Peta Publik.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 border-b pb-2">Informasi Dasar</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="namaUmkm">Nama Usaha / UMKM *</Label>
                    <Input id="namaUmkm" required value={namaUmkm} onChange={e => setNamaUmkm(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="namaPemilik">Nama Pemilik *</Label>
                    <Input id="namaPemilik" required value={namaPemilik} onChange={e => setNamaPemilik(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Kategori *</Label>
                    <Select required onValueChange={(val: string | null) => setKategoriId(val || '')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {kategoriList.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.nama}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Kecamatan *</Label>
                    <Select required onValueChange={(val: string | null) => setKecamatanId(val || '')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kecamatan" />
                      </SelectTrigger>
                      <SelectContent>
                        {kecamatanList.map(kec => (
                          <SelectItem key={kec.id} value={kec.id}>{kec.nama_kecamatan}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">Nomor WhatsApp *</Label>
                    <Input id="whatsapp" placeholder="Contoh: 628123456789" required value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
                    <p className="text-xs text-slate-500">Awali dengan 62 tanpa spasi/tanda plus.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="foto">Foto Utama UMKM</Label>
                    <Input id="foto" type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 border-b pb-2">Lokasi & Detail</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="alamat">Alamat Lengkap *</Label>
                    <Textarea id="alamat" required value={alamat} onChange={e => setAlamat(e.target.value)} rows={3} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deskripsi">Deskripsi Singkat Usaha *</Label>
                    <Textarea id="deskripsi" required value={deskripsi} onChange={e => setDeskripsi(e.target.value)} rows={4} />
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <Label className="flex justify-between">
                      <span>Titik Lokasi Peta *</span>
                      {location && <span className="text-green-600 text-xs">Lokasi terpilih ✓</span>}
                    </Label>
                    <p className="text-xs text-slate-500 mb-2">Klik pada peta untuk menandai lokasi persis UMKM Anda.</p>
                    <div className="relative">
                      <MapPicker onLocationSelect={(lat, lng) => setLocation({lat, lng})} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t flex justify-end">
                <Button type="button" variant="outline" className="mr-3" onClick={() => router.back()}>
                  Batal
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
                  ) : (
                    'Ajukan UMKM'
                  )}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50/50">
              <CheckCircle2 size={48} className="text-emerald-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Pendaftaran Berhasil!</h3>
            <p className="text-slate-500 mb-8 font-medium leading-relaxed">
              Selamat, UMKM Anda telah berhasil didaftarkan. Data Anda akan ditinjau oleh tim kami sebelum tampil di Peta Publik.
            </p>
            <Button 
              className="w-full bg-slate-900 hover:bg-blue-600 text-white h-14 text-lg font-bold rounded-2xl transition-all shadow-xl shadow-slate-200"
              onClick={() => {
                router.push('/dashboard');
                router.refresh();
              }}
            >
              Kembali ke Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
