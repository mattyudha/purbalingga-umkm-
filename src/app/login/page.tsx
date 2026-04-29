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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
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
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      {/* Left Side - Premium Map Visual */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img
            src="/purbalingga_map_visual_1777380737454.png"
            alt="Purbalingga Map Visual"
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
            className="flex items-center gap-4 group cursor-pointer"
          >
            <div className="bg-white/10 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-2xl group-hover:bg-white transition-all duration-300">
              <img src="/purbalinggalogo.png" alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tighter uppercase leading-none">Purbalingga</span>
              <span className="text-[10px] font-bold text-blue-400 tracking-[0.3em] uppercase mt-1">GIS Portal Untu UMKM Purbalingga</span>
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
                <span>Resmi Pemerintah Kabupaten Purbalingga</span>
              </div>
              <h1 className="text-6xl font-black leading-[1.1] mb-8 tracking-tight">
                Transformasi Digital <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">UMKM Purbalingga.</span>
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
            © 2026 Pemerintah Kabupaten Purbalingga • Layanan Digital Terpadu
          </div>
        </div>
      </div>

      {/* Right Side - Premium Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-8 sm:p-16 relative overflow-hidden">
        {/* Subtle background effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px] relative z-10"
        >
          <div className="lg:hidden flex justify-center mb-12">
            <Link href="/" className="flex flex-col items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-3xl text-white shadow-2xl shadow-blue-500/20">
                <img src="/purbalinggalogo.png" alt="Logo" className="w-12 h-12 object-contain brightness-0 invert" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 uppercase">Purbalingga</span>
            </Link>
          </div>

          <div className="mb-12 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-4">
              <ShieldCheck size={16} />
              <span>Secure Authentication</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight">Selamat Datang Kembali.</h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">Masukkan kredensial Anda untuk mengakses panel manajemen UMKM.</p>
          </div>

          <div className="space-y-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-slate-800 font-bold text-sm ml-1 flex items-center justify-between">
                  Alamat Email
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Required</span>
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 bg-white border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all rounded-2xl px-5 text-base font-medium placeholder:text-slate-300 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-slate-800 font-bold text-sm">Kata Sandi</Label>
                  <Link href="/forgot-password" size="sm" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
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
                    className="h-14 bg-white border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all rounded-2xl px-5 text-base font-medium placeholder:text-slate-300 shadow-sm pr-14"
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

              <Button className="w-full h-14 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
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
                <span className="w-full border-t border-slate-200"></span>
              </div>
              <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                <span className="bg-slate-50 lg:bg-white px-4 text-slate-400">Atau Lanjutkan Sebagai</span>
              </div>
            </div>

            <div className="text-center">
              <Link href="/register" className="inline-flex flex-col items-center group">
                <span className="text-slate-500 text-sm font-medium mb-1">Belum terdaftar sebagai pelaku UMKM?</span>
                <span className="text-blue-600 font-black text-base group-hover:text-blue-700 transition-all border-b-2 border-transparent group-hover:border-blue-700">Daftar Sekarang &rarr;</span>
              </Link>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center gap-6">
            <Link href="/" className="group flex items-center gap-3 text-slate-400 hover:text-slate-600 transition-all text-sm font-bold bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100 hover:border-slate-200">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Kembali ke Beranda
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
