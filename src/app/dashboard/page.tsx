import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Dashboard UMKM</h1>
              <p className="text-slate-500">Selamat datang, {profile?.full_name || user.email}</p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase font-semibold tracking-wide">
                Role: {profile?.role || 'Umum'}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-lg font-semibold mb-4">Aksi Tersedia</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <Link href="/" className="p-4 border rounded-lg hover:border-blue-500 hover:shadow-sm transition-all group">
                <h3 className="font-semibold text-blue-600 group-hover:text-blue-700">Lihat Peta Publik &rarr;</h3>
                <p className="text-sm text-slate-500 mt-1">Kembali ke halaman utama untuk melihat peta sebaran UMKM.</p>
              </Link>

              {profile?.role === 'pemilik_umkm' && (
                <Link href="/dashboard/umkm/create" className="p-4 border rounded-lg hover:border-blue-500 hover:shadow-sm transition-all group bg-white">
                  <h3 className="font-semibold text-slate-700 group-hover:text-blue-600">Tambah UMKM Baru &rarr;</h3>
                  <p className="text-sm text-slate-500 mt-1">Input data dan tentukan lokasi peta untuk UMKM Anda.</p>
                </Link>
              )}

              {(profile?.role === 'super_admin' || profile?.role === 'admin_dinas') && (
                <Link href="/admin" className="p-4 border rounded-lg hover:border-green-500 hover:shadow-sm transition-all group bg-white">
                  <h3 className="font-semibold text-slate-700 group-hover:text-green-600">Verifikasi UMKM &rarr;</h3>
                  <p className="text-sm text-slate-500 mt-1">Review dan verifikasi pengajuan UMKM baru.</p>
                </Link>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
