'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Settings, LogOut } from 'lucide-react';
import ProfileEditModal from './ProfileEditModal';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ProfileSectionProps {
  profile: any;
  userEmail: string;
}

export default function ProfileSection({ profile, userEmail }: ProfileSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-heading font-black text-slate-800 ml-1 tracking-tight">Pengaturan Akun</h2>
      <Card className="border-0 shadow-sm rounded-[32px] overflow-hidden bg-white border border-slate-100/50">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 shadow-xl bg-slate-50 flex items-center justify-center text-slate-300">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full object-cover" alt={profile.full_name} />
                ) : (
                  <UserIcon size={48} strokeWidth={1.5} />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full border-2 border-white shadow-lg">
                <Settings size={12} />
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-heading font-black text-slate-900 tracking-tight">{profile?.full_name}</h3>
              <p className="text-sm font-medium text-slate-400">{userEmail}</p>
            </div>
            
            <div className="w-full pt-4 space-y-3">
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(true)}
                className="w-full rounded-2xl gap-2 h-12 border-slate-200 font-bold hover:bg-slate-50 hover:text-blue-600 transition-all"
              >
                <Settings size={18} /> Edit Profil
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="w-full rounded-2xl text-red-600 hover:bg-red-50 h-12 font-bold flex items-center justify-center gap-2"
              >
                <LogOut size={18} /> Keluar dari Sesi
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProfileEditModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        profile={profile}
        userEmail={userEmail}
      />
    </div>
  );
}
