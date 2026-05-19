'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Loader2, CheckCircle2, Eye, EyeOff, ArrowLeft, ShieldCheck, Globe, Star, Plus } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'pemilik_umkm'
        }
      }
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setIsSuccess(true);
      setIsLoading(false);
    }
  };

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div
        className="flex items-center justify-center bg-slate-50 p-6"
        style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="w-full max-w-lg"
        >
          <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-0 text-center p-10 rounded-[2.5rem] bg-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-emerald-500" />
            <CardContent className="flex flex-col items-center space-y-8 pt-8">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center shadow-inner relative">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg"
                >
                  <Star size={16} fill="currentColor" />
                </motion.div>
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Akun Berhasil Dibuat!</h2>
                <p className="text-slate-500 text-lg leading-relaxed font-medium">
                  Selamat datang di ekosistem digital Kabupaten Banyumas. Langkah terakhir, silakan verifikasi email Anda atau masuk langsung untuk mulai mengelola UMKM.
                </p>
              </div>
              <div className="grid grid-cols-1 w-full gap-4 pt-4">
                <Button
                  onClick={() => router.push('/login')}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                >
                  Masuk ke Dashboard
                </Button>
                <Link href="/" className="text-slate-400 font-bold hover:text-slate-600 transition-all py-2">
                  Kembali ke Beranda
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ── Register Form ───────────────────────────────────────────────────────────
  return (
    // Mobile: fixed+locked. Desktop: normal min-h-screen flow.
    <div className="fixed inset-0 lg:static lg:min-h-screen flex bg-[#F8F9FB] selection:bg-blue-100 selection:text-blue-900 overflow-hidden lg:overflow-visible">
      {/* Left Side - Visual Branding (desktop only) */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden bg-slate-900 shrink-0">
        <div className="absolute inset-0 z-0">
          <img
            src="/banyumas-map-visual.svg"
            alt="Banyumas Map Visual"
            className="w-full h-full object-cover opacity-60 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-slate-900 via-slate-900/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-slate-900" />
        </div>

        <div className="relative z-10 w-full flex flex-col justify-between p-16 text-white">
          <Link href="/" className="flex items-center gap-4 group cursor-pointer w-fit">
            <div className="bg-slate-900/50 backdrop-blur-2xl p-4 rounded-[2rem] border border-white/10 shadow-2xl group-hover:bg-white/10 transition-all duration-500 ring-1 ring-white/5 group-hover:ring-white/20 group-hover:scale-105">
              <img src="/purbalinggalogo.png" alt="Logo Banyumas" className="w-16 h-16 object-contain drop-shadow-lg" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-4xl font-black tracking-tighter uppercase leading-none text-white drop-shadow-md">Banyumas</span>
              <span className="text-[11px] font-black text-blue-400 tracking-[0.3em] uppercase mt-2 drop-shadow-md">GIS Portal Untuk UMKM Banyumas</span>
            </div>
          </Link>

          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-6 backdrop-blur-sm">
                <Globe size={14} />
                <span>Resmi Pemerintah Kabupaten Banyumas</span>
              </div>
              <h1 className="text-6xl font-black leading-[1.1] mb-8 tracking-tight">
                Mulai Digitalisasi <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Usaha Anda.</span>
              </h1>
              <p className="text-slate-300 text-xl leading-relaxed font-medium mb-12 max-w-md">
                Bergabunglah dengan ribuan pelaku usaha lainnya di Kabupaten Banyumas dalam satu platform manajemen terpadu.
              </p>
            </motion.div>

            <div className="space-y-4">
              {[
                { icon: ShieldCheck, text: 'Verifikasi Legalitas & Identitas Resmi' },
                { icon: Globe, text: 'Akses Peta Publik & Promosi Digital' },
                { icon: Star, text: 'Prioritas Program Bantuan Pemerintah' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 * i }}
                  className="flex items-center gap-5 text-slate-100 bg-white/5 backdrop-blur-md p-5 rounded-[1.5rem] border border-white/10"
                >
                  <div className="bg-blue-500/20 p-2.5 rounded-xl text-blue-400 shadow-inner">
                    <item.icon size={22} />
                  </div>
                  <span className="text-base font-bold tracking-tight">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-slate-500 text-sm font-medium">
            Sistem Pendaftaran Terpadu • Dinas Koperasi & UKM Banyumas
          </div>
        </div>
      </div>

      {/* Right Side - scrollable on mobile, centered on desktop */}
      <div
        className="flex-1 flex flex-col items-center lg:justify-center relative overflow-x-hidden overflow-y-auto lg:overflow-hidden"
        style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
      >
        {/* Mobile Background */}
        <div className="absolute inset-0 z-0 lg:hidden pointer-events-none">
          <img
            src="/banyumas-map-visual.svg"
            alt="Banyumas Map Visual"
            className="w-full h-full object-cover opacity-[0.12]"
            style={{ transform: 'scale(1.05)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/60 via-slate-50/85 to-slate-50" />
        </div>

        {/* Decorative blobs — clipped so they don't cause overflow */}
        <div
          className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[90px] z-0 pointer-events-none"
          style={{ transform: 'translate(30%, -30%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[90px] z-0 pointer-events-none"
          style={{ transform: 'translate(-30%, 30%)' }}
        />

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-[420px] lg:max-w-[460px] relative z-10
            bg-white/75 lg:bg-white
            backdrop-blur-2xl lg:backdrop-blur-none
            p-8 sm:p-10 lg:p-12
            rounded-[2.5rem] lg:rounded-[1.5rem]
            shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] lg:shadow-[0_8px_30px_rgb(0,0,0,0.05)]
            border border-white/60 lg:border-slate-100 mx-auto"
          style={{
            marginTop: 'max(env(safe-area-inset-top, 0px), 32px)',
            marginBottom: 'max(env(safe-area-inset-bottom, 0px), 32px)',
          }}
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center justify-center mb-10 text-center">
            <Link href="/" className="flex flex-col items-center gap-4 group">
              <div className="bg-gradient-to-tr from-slate-900 to-slate-800 p-4 rounded-[1.5rem] text-white shadow-xl shadow-slate-900/20 border border-slate-700/50 group-hover:scale-105 transition-all duration-500 ring-1 ring-white/10">
                <img src="/purbalinggalogo.png" alt="Logo Banyumas" className="w-14 h-14 object-contain drop-shadow-md" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black tracking-tighter text-slate-900 uppercase leading-none">Banyumas</span>
                <span className="text-[10px] font-bold text-blue-600 tracking-[0.2em] uppercase mt-1.5">GIS Portal Untuk UMKM</span>
              </div>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest mb-3">
              <Plus className="w-4 h-4" />
              <span>Buat Akun Baru</span>
            </div>
            <h2 className="text-[28px] lg:text-[36px] font-heading font-bold text-slate-900 mb-3 tracking-tighter leading-[1.1]">
              Daftar Pelaku<br />UMKM.
            </h2>
            <p className="text-[14px] lg:text-[15px] text-slate-500 max-w-[280px] lg:max-w-none mx-auto lg:mx-0 leading-[1.6]">
              Lengkapi formulir di bawah untuk memulai akses portal manajemen UMKM Banyumas.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-slate-600 font-medium text-[13px] ml-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Budi Santoso"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-[44px] lg:h-[50px] bg-white border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all rounded-[10px] px-4 text-[15px] placeholder:text-[14px] placeholder:text-[#9CA3AF] shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-600 font-medium text-[13px] ml-1">
                Alamat Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-[44px] lg:h-[50px] bg-white border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all rounded-[10px] px-4 text-[15px] placeholder:text-[14px] placeholder:text-[#9CA3AF] shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-600 font-medium text-[13px] ml-1">
                Kata Sandi <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-[44px] lg:h-[50px] bg-white border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all rounded-[10px] px-4 text-[15px] placeholder:text-[14px] placeholder:text-[#9CA3AF] shadow-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 flex items-center gap-3 shadow-sm shadow-red-100"
              >
                <div className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                {error}
              </motion.div>
            )}

            <Button
              className="w-full h-[48px] lg:h-[54px] bg-slate-900 hover:bg-slate-800 text-white rounded-[12px] font-semibold text-[15px] lg:text-[16px] shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Buat Akun Sekarang'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200/60" />
            </div>
            <div className="relative flex justify-center text-[13px] font-medium text-slate-400">
              <span className="bg-white/90 lg:bg-white px-4">Sudah punya akun?</span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link href="/login" className="inline-flex flex-col items-center group">
              <span className="text-blue-600 font-black text-base group-hover:text-blue-700 transition-all border-b-2 border-transparent group-hover:border-blue-700">
                Masuk ke Akun →
              </span>
            </Link>
          </div>

          {/* Back button */}
          <div className="mt-10 flex flex-col items-center gap-6">
            <Link
              href="/"
              className="group flex items-center gap-3 text-slate-500 hover:text-slate-700 transition-all text-sm font-bold bg-white/50 lg:bg-white px-6 py-3 rounded-full shadow-sm border border-slate-200/50 hover:border-slate-300 backdrop-blur-sm"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Kembali ke Beranda
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
