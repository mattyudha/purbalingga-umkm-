'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { LogIn, User as UserIcon, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserNav({ mobile, onAuthClick }: { mobile?: boolean, onAuthClick?: (type: 'login' | 'register') => void }) {
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
      <div className={`flex gap-2 ${mobile ? 'flex-col w-full' : 'items-center'}`}>
        {mobile && onAuthClick ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => onAuthClick('login')} className="text-slate-600 w-full justify-start rounded-xl">
              <LogIn className="w-4 h-4 mr-2" /> Masuk
            </Button>
            <Button size="sm" onClick={() => onAuthClick('register')} className="bg-blue-600 hover:bg-blue-700 text-white w-full rounded-xl">
              Daftar
            </Button>
          </>
        ) : (
          <>
            <Link href="/login" className={mobile ? 'w-full' : ''}>
              <Button variant="ghost" size="sm" className={`text-slate-600 ${mobile ? 'w-full justify-start rounded-xl' : ''}`}>
                <LogIn className="w-4 h-4 mr-2" /> Masuk
              </Button>
            </Link>
            <Link href="/register" className={mobile ? 'w-full' : ''}>
              <Button size="sm" className={`bg-blue-600 hover:bg-blue-700 text-white ${mobile ? 'w-full rounded-xl' : ''}`}>
                Daftar
              </Button>
            </Link>
          </>
        )}
      </div>
    );
  }

  const roleLabels: any = {
    'super_admin': 'Admin',
    'admin_dinas': 'Dinas',
    'pemilik_umkm': 'Pemilik',
  };

  return (
    <div className={`flex ${mobile ? 'flex-col gap-5 w-full' : 'items-center gap-3'}`}>
      <div className={`flex flex-col ${mobile ? 'items-start bg-slate-50 p-4 rounded-xl border border-slate-100' : 'items-end mr-1 hidden sm:flex'}`}>
        <span className="text-xs font-semibold text-slate-900">{profile?.full_name || user.email}</span>
        {profile?.role && (
          <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-blue-50 text-blue-700 border-blue-100 mt-1">
            {roleLabels[profile.role] || 'Member'}
          </Badge>
        )}
      </div>
      
      <div className={`flex ${mobile ? 'flex-col gap-2 w-full' : 'items-center gap-2'}`}>
        <Link href="/dashboard" className={mobile ? 'w-full' : ''}>
          <Button variant="outline" size={mobile ? 'default' : 'icon'} className={mobile ? 'w-full justify-start rounded-xl h-11' : 'rounded-full w-9 h-9'}>
            <LayoutDashboard className="w-4 h-4 mr-3" /> {mobile ? 'Dashboard' : ''}
          </Button>
        </Link>
        
        {['super_admin', 'admin_dinas'].includes(profile?.role) && (
          <Link href="/admin" className={mobile ? 'w-full' : ''}>
            <Button variant="outline" size={mobile ? 'default' : 'icon'} className={mobile ? 'w-full justify-start rounded-xl h-11 border-green-200 text-green-700 bg-green-50/30' : 'rounded-full w-9 h-9 border-green-200 text-green-700'}>
              <ShieldCheck className="w-4 h-4 mr-3" /> {mobile ? 'Admin Panel' : ''}
            </Button>
          </Link>
        )}

        <Button variant="ghost" size={mobile ? 'default' : 'icon'} onClick={handleLogout} className={mobile ? 'w-full justify-start rounded-xl h-11 text-slate-500 hover:text-red-600 hover:bg-red-50' : 'rounded-full w-9 h-9 text-slate-500 hover:text-red-600'}>
          <LogOut className="w-4 h-4 mr-3" /> {mobile ? 'Keluar Akun' : ''}
        </Button>
      </div>
    </div>
  );
}
