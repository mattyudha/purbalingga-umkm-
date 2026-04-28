import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Store, Plus, Map as MapIcon, ShieldCheck, 
  Settings, User as UserIcon, LayoutDashboard,
  ArrowRight
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const roleLabels: any = {
    'super_admin': 'Administrator',
    'admin_dinas': 'Petugas Dinas',
    'pemilik_umkm': 'Pemilik UMKM',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider mb-2">
                <LayoutDashboard size={18} />
                <span>Portal Pengguna</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                Halo, {profile?.full_name?.split(' ')[0] || 'Pengguna'}!
              </h1>
              <p className="text-slate-500 max-w-lg">
                Selamat datang di dashboard portal UMKM Purbalingga. Kelola data usaha Anda atau akses panel administrasi di sini.
              </p>
              
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 uppercase tracking-wide">
                  Status: {roleLabels[profile?.role] || 'Member'}
                </div>
                <div className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-100">
                  {user.email}
                </div>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 opacity-50" />
            <div className="absolute bottom-0 right-10 hidden md:block">
              <Store size={120} className="text-slate-100" strokeWidth={1} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Actions Grid */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800 ml-1">Navigasi Cepat</h2>
              <div className="grid grid-cols-1 gap-4">
                <Link href="/" className="group">
                  <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all hover:ring-2 hover:ring-blue-500/20">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="bg-blue-100 text-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                        <MapIcon size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900">Lihat Peta Publik</h3>
                        <p className="text-sm text-slate-500">Lihat sebaran UMKM di peta Purbalingga.</p>
                      </div>
                      <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </CardContent>
                  </Card>
                </Link>

                {profile?.role === 'pemilik_umkm' && (
                  <Link href="/dashboard/umkm/create" className="group">
                    <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all hover:ring-2 hover:ring-emerald-500/20">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                          <Plus size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900">Daftarkan UMKM Baru</h3>
                          <p className="text-sm text-slate-500">Tambahkan data usaha Anda ke dalam sistem.</p>
                        </div>
                        <ArrowRight size={20} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                      </CardContent>
                    </Card>
                  </Link>
                )}

                {(profile?.role === 'super_admin' || profile?.role === 'admin_dinas') && (
                  <Link href="/admin" className="group">
                    <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all hover:ring-2 hover:ring-indigo-500/20">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                          <ShieldCheck size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900">Panel Verifikasi Admin</h3>
                          <p className="text-sm text-slate-500">Review dan setujui pengajuan UMKM baru.</p>
                        </div>
                        <ArrowRight size={20} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </CardContent>
                    </Card>
                  </Link>
                )}
              </div>
            </div>

            {/* Profile Summary / Settings */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800 ml-1">Pengaturan Akun</h2>
              <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border-4 border-slate-50 shadow-inner">
                      <UserIcon size={48} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{profile?.full_name}</h3>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                    
                    <div className="w-full pt-4 space-y-3">
                      <Button variant="outline" className="w-full rounded-xl gap-2 h-11 border-slate-200">
                        <Settings size={18} /> Edit Profil
                      </Button>
                      <Button variant="ghost" className="w-full rounded-xl text-red-600 hover:bg-red-50 h-11">
                        Keluar dari Sesi
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 px-4 text-center">
        <p className="text-sm text-slate-400 font-medium">
          © 2026 Pemerintah Kabupaten Purbalingga
        </p>
      </footer>
    </div>
  )
}
