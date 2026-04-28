'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, MapPin, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [umkmList, setUmkmList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingUmkm();
  }, [supabase]);

  const fetchPendingUmkm = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('umkm')
      .select(`
        *,
        kategori_umkm(nama),
        kecamatan(nama_kecamatan),
        umkm_photos(cloudinary_url)
      `)
      .eq('status_verifikasi', 'pending')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUmkmList(data);
    }
    setIsLoading(false);
  };

  const handleVerifikasi = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    const { error } = await supabase
      .from('umkm')
      .update({ status_verifikasi: status })
      .eq('id', id);

    if (!error) {
      // Remove from list or refresh
      setUmkmList(prev => prev.filter(item => item.id !== id));
    } else {
      alert("Gagal memverifikasi: " + error.message);
    }
    setProcessingId(null);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-slate-500">Verifikasi pengajuan UMKM baru</p>
          </div>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            &larr; Kembali ke Home
          </Link>
        </div>

        {umkmList.length === 0 ? (
          <Card className="text-center py-12 border-dashed bg-slate-50">
            <CardContent>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">Semua UMKM sudah diverifikasi</h3>
              <p className="text-slate-500 mt-1">Tidak ada pengajuan UMKM yang berstatus pending saat ini.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {umkmList.map((umkm) => {
              const photoUrl = umkm.umkm_photos?.[0]?.cloudinary_url;
              return (
                <Card key={umkm.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="md:w-1/4 h-48 md:h-auto bg-slate-200 relative">
                      {photoUrl ? (
                        <img 
                          src={photoUrl} 
                          alt={umkm.nama_umkm} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">
                          <span className="text-sm">Tidak ada foto</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-6 md:w-3/4 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">{umkm.nama_umkm}</h3>
                            <p className="text-sm text-slate-500 font-medium">{umkm.kategori_umkm?.nama} • {umkm.kecamatan?.nama_kecamatan}</p>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase">
                            Pending
                          </span>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                          <div>
                            <p><strong>Pemilik:</strong> {umkm.nama_pemilik}</p>
                            <p><strong>WhatsApp:</strong> +{umkm.whatsapp}</p>
                            <p className="mt-2 line-clamp-2"><strong>Deskripsi:</strong> {umkm.deskripsi}</p>
                          </div>
                          <div>
                            <p className="flex items-start gap-1">
                              <MapPin size={16} className="mt-0.5 shrink-0" /> 
                              <span className="line-clamp-2">{umkm.alamat}</span>
                            </p>
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${umkm.latitude},${umkm.longitude}`}
                              target="_blank"
                              className="text-blue-600 hover:underline inline-flex items-center mt-1 ml-5"
                            >
                              <Eye size={14} className="mr-1" /> Lihat di Peta
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                        <Button 
                          variant="outline" 
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleVerifikasi(umkm.id, 'rejected')}
                          disabled={processingId === umkm.id}
                        >
                          {processingId === umkm.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                          Tolak
                        </Button>
                        <Button 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleVerifikasi(umkm.id, 'approved')}
                          disabled={processingId === umkm.id}
                        >
                          {processingId === umkm.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                          Setujui
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
