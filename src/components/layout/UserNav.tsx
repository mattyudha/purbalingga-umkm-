'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { LogIn, User as UserIcon, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserNav() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // ✅ Gunakan useRef agar instance supabase stabil dan tidak trigger re-render
  const supabaseRef = useRef(createClient());
  const router = useRouter();

  useEffect(() => {
    const supabase = supabaseRef.current;

    async function getAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profile);
      }
      setLoading(false);
    }
    getAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // ✅ Empty array: supabase stabil via ref, tidak perlu di dependency

  const handleLogout = async () => {
    await supabaseRef.current.auth.signOut();
    router.refresh();
  };

  if (loading) return <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="text-slate-600">
            <LogIn className="w-4 h-4 mr-2" /> Masuk
          </Button>
        </Link>
        <Link href="/register">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            Daftar
          </Button>
        </Link>
      </div>
    );
  }

  const roleLabels: any = {
    'super_admin': 'Admin',
    'admin_dinas': 'Dinas',
    'pemilik_umkm': 'Pemilik',
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-end mr-1 hidden sm:flex">
        <span className="text-xs font-semibold text-slate-900">{profile?.full_name || user.email}</span>
        {profile?.role && (
          <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-blue-50 text-blue-700 border-blue-100">
            {roleLabels[profile.role] || 'Member'}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="outline" size="icon" className="rounded-full w-9 h-9">
            <LayoutDashboard className="w-4 h-4" />
          </Button>
        </Link>
        
        {profile?.role === 'super_admin' && (
          <Link href="/admin">
            <Button variant="outline" size="icon" className="rounded-full w-9 h-9 border-green-200 text-green-700">
              <ShieldCheck className="w-4 h-4" />
            </Button>
          </Link>
        )}

        <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full w-9 h-9 text-slate-500 hover:text-red-600">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
