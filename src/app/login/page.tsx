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
import { MapPin, Loader2, Eye, EyeOff, ArrowLeft, ShieldCheck, Globe } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!supabase || !supabase.auth) {
        throw new Error('Supabase client not initialized. Please check your environment variables.');
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      // Auto-promote admin@gmail.com for initial setup
      if (email === 'admin@gmail.com') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({ role: 'super_admin' })
            .eq('id', user.id);
        }
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8F9FB] selection:bg-blue-100 selection:text-blue-900">
      {/* Left Side - Premium Map Visual */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img
            src="/banyumas-map-visual.svg"
            alt="Banyumas Map Visual"
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/30" />
        </div>

        <div className="relative z-10 w-full flex flex-col justify-between p-16 text-white">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-6 group cursor-pointer"
          >
            <div className="bg-slate-900/50 backdrop-blur-2xl p-4 rounded-[2rem] border border-white/10 shadow-2xl group-hover:bg-white/10 transition-all duration-500 ring-1 ring-white/5 group-hover:ring-white/20 group-hover:scale-105">
              <img src="/purbalinggalogo.png" alt="Logo Banyumas" className="w-16 h-16 lg:w-20 lg:h-20 object-contain drop-shadow-lg" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-none text-white drop-shadow-md">Banyumas</span>
              <span className="text-[11px] lg:text-xs font-black text-blue-400 tracking-[0.3em] uppercase mt-2 drop-shadow-md">GIS Portal Untuk UMKM Banyumas</span>
            </div>
          </motion.div>

          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6 backdrop-blur-sm">
                <Globe size={14} />
                <span>Resmi Pemerintah Kabupaten Banyumas</span>
              </div>
              <h1 className="text-6xl font-black leading-[1.1] mb-8 tracking-tight">
                Transformasi Digital <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">UMKM Banyumas.</span>
              </h1>
              <p className="text-slate-300 text-xl leading-relaxed font-medium mb-10 max-w-lg">
                Sistem Informasi Geografis terintegrasi untuk pemetaan, analisis, dan pengembangan ekosistem ekonomi kreatif daerah.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-12"
            >
              <div className="flex flex-col">
                <span className="text-white text-3xl font-black tracking-tight">1.2k+</span>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pelaku UMKM</span>
              </div>
              <div className="h-10 w-[1px] bg-white/10" />
              <div className="flex flex-col">
                <span className="text-white text-3xl font-black tracking-tight">100%</span>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Terverifikasi</span>
              </div>
              <div className="h-10 w-[1px] bg-white/10" />
              <div className="flex flex-col">
                <span className="text-white text-3xl font-black tracking-tight">24/7</span>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Akses Portal</span>
              </div>
            </motion.div>
          </div>

          <div className="text-slate-500 text-sm font-medium">
            © 2026 Pemerintah Kabupaten Banyumas • Layanan Digital Terpadu
          </div>
        </div>
      </div>

      {/* Right Side - Premium Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden min-h-screen lg:min-h-0">
        
        {/* Mobile Background - Only visible on small screens */}
        <div className="absolute inset-0 z-0 lg:hidden">
          <img
            src="/banyumas-map-visual.svg"
            alt="Banyumas Map Visual"
            className="w-full h-full object-cover opacity-[0.15] scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 via-slate-50/80 to-slate-50" />
        </div>

        {/* Subtle background effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 lg:bg-blue-500/5 rounded-full blur-[100px] lg:blur-[120px] -translate-y-1/2 translate-x-1/2 z-0" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 lg:bg-emerald-500/5 rounded-full blur-[100px] lg:blur-[120px] translate-y-1/2 -translate-x-1/2 z-0" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[390px] relative z-10 bg-white/70 lg:bg-white backdrop-blur-2xl lg:backdrop-blur-none p-8 sm:p-10 lg:p-10 rounded-[2.5rem] lg:rounded-[1.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] lg:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 lg:border-slate-100"
        >
          <div className="lg:hidden flex flex-col items-center justify-center mb-16 text-center">
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

          <div className="mb-8 pt-10 text-center lg:text-left">
            <h2 className="text-[28px] lg:text-[32px] font-heading font-bold text-slate-900 mb-3 tracking-tighter leading-[1.1]">Selamat Datang<br/>Kembali.</h2>
            <p className="text-[14px] text-slate-500 max-w-[260px] mx-auto lg:mx-0 leading-[1.6]">Masukkan kredensial Anda untuk mengakses panel manajemen UMKM.</p>
          </div>

          <div className="space-y-5">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-600 font-medium text-[13px] ml-1 flex items-center">
                  Alamat Email
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-[44px] bg-white border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all rounded-[10px] px-4 text-[15px] placeholder:text-[14px] placeholder:text-[#9CA3AF] shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-slate-600 font-medium text-[13px]">Kata Sandi <span className="text-red-500 ml-0.5">*</span></Label>
                  <Link href="/forgot-password" className="text-[13px] font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    Lupa Password?
                  </Link>
                </div>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-[44px] bg-white border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all rounded-[10px] px-4 text-[15px] placeholder:text-[14px] placeholder:text-[#9CA3AF] shadow-sm pr-12"
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

              <Button className="w-full h-[48px] bg-slate-900 hover:bg-slate-800 text-white rounded-[12px] font-semibold text-[15px] shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Masuk ke Panel
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200/60"></span>
              </div>
              <div className="relative flex justify-center text-[13px] font-medium text-slate-400">
                <span className="bg-white/90 lg:bg-white px-4 lowercase first-letter:uppercase">Atau lanjutkan sebagai</span>
              </div>
            </div>

            <div className="text-center">
              <Link href="/register" className="inline-flex flex-col items-center group">
                <span className="text-slate-500 text-sm font-medium mb-1">Belum terdaftar sebagai pelaku UMKM?</span>
                <span className="text-blue-600 font-black text-base group-hover:text-blue-700 transition-all border-b-2 border-transparent group-hover:border-blue-700">Daftar Sekarang &rarr;</span>
              </Link>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-6">
            <Link href="/" className="group flex items-center gap-3 text-slate-500 hover:text-slate-700 transition-all text-sm font-bold bg-white/50 lg:bg-white px-6 py-3 rounded-full shadow-sm border border-slate-200/50 hover:border-slate-300 backdrop-blur-sm">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Kembali ke Beranda
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
