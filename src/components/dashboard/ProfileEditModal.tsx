'use client';

import React, { useState, useRef } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  userEmail: string;
}

export default function ProfileEditModal({ isOpen, onClose, profile, userEmail }: ProfileEditModalProps) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show immediate local preview for better UX
    const localPreview = URL.createObjectURL(file);
    setAvatarUrl(localPreview);

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        console.log('Uploading avatar to Cloudinary...');
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64, folder: 'avatars' })
        });
        
        const data = await res.json();
        if (data.url) {
          console.log('Upload success:', data.url);
          setAvatarUrl(data.url);
        } else {
          throw new Error(data.error || 'Upload failed');
        }
      };
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Gagal mengunggah foto ke server');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      router.refresh();
      onClose();
    } catch (error: any) {
      alert('Gagal memperbarui profil: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] rounded-[32px] p-8 border-none shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-heading font-black text-slate-900 tracking-tight">Edit Profil</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium leading-relaxed">
            Perbarui informasi akun Anda untuk personalisasi pengalaman dashboard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 py-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-50 shadow-xl bg-slate-100 flex items-center justify-center relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                ) : (
                  <div className="text-slate-300">
                    <Camera size={40} strokeWidth={1.5} />
                  </div>
                )}
                
                {uploading && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="animate-spin text-blue-600" size={24} />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klik untuk ganti foto</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2.5">
              <Label className="text-sm font-bold text-slate-800 ml-1">Nama Lengkap</Label>
              <Input 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap..."
                className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 transition-all font-medium"
                required
              />
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-bold text-slate-800 ml-1">Email</Label>
              <Input 
                value={userEmail}
                disabled
                className="h-12 bg-slate-50 border-slate-100 rounded-xl font-medium text-slate-400 cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-400 font-medium ml-1 italic">Email tidak dapat diubah di panel ini.</p>
            </div>
          </div>

          <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose} 
              className="flex-1 h-12 rounded-xl font-bold text-slate-500"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || uploading}
              className="flex-1 h-12 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-slate-200 transition-all active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" size={18} />
              ) : (
                <CheckCircle2 className="mr-2" size={18} />
              )}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
