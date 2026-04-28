'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { MapPin, Loader2, CheckCircle2, Eye, EyeOff, ArrowLeft, ShieldCheck, Globe, Star, Plus } from 'lucide-react';

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

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
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
                  Selamat datang di ekosistem digital Purbalingga. Langkah terakhir, silakan verifikasi email Anda atau masuk langsung untuk mulai mengelola UMKM.
                </p>
              </div>
              <div className="grid grid-cols-1 w-full gap-4 pt-4">
                <Button onClick={() => router.push('/login')} className="bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-95">
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

  return (
    <div className="min-h-screen flex bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      {/* Left Side - Visual Branding */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="/purbalingga_map_visual_1777380737454.png" 
            alt="Purbalingga Map Visual" 
            className="w-full h-full object-cover opacity-60 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-slate-900 via-slate-900/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-slate-900" />
        </div>
        
        <div className="relative z-10 w-full flex flex-col justify-between p-16 text-white">
          <Link href="/" className="flex items-center gap-4 group cursor-pointer w-fit">
            <div className="bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/20 shadow-2xl group-hover:bg-white group-hover:text-blue-600 transition-all duration-300">
              <MapPin size={32} />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tighter uppercase leading-none">Purbalingga</span>
              <span className="text-[10px] font-bold text-blue-400 tracking-[0.3em] uppercase mt-1">Enterprise GIS Portal</span>
            </div>
          </Link>
          
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl font-black leading-[1.1] mb-8 tracking-tight">
                Mulai Digitalisasi <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Usaha Anda.</span>
              </h1>
              <p className="text-slate-300 text-xl leading-relaxed font-medium mb-12 max-w-md">
                Bergabunglah dengan ribuan pelaku usaha lainnya di Kabupaten Purbalingga dalam satu platform manajemen terpadu.
              </p>
            </motion.div>
            
            <div className="space-y-6">
              {[
                { icon: ShieldCheck, text: "Verifikasi Legalitas & Identitas Resmi" },
                { icon: Globe, text: "Akses Peta Publik & Promosi Digital" },
                { icon: Star, text: "Prioritas Program Bantuan Pemerintah" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 * i }}
                  className="flex items-center gap-5 text-slate-100 bg-white/5 backdrop-blur-md p-5 rounded-[1.5rem] border border-white/10"
                >
                  <div className="bg-blue-500/20 p-2.5 rounded-xl text-blue-400 shadow-inner">
                    <item.icon size={24} />
                  </div>
                  <span className="text-lg font-bold tracking-tight">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="text-slate-500 text-sm font-medium">
            Sistem Pendaftaran Terpadu • Dinas Koperasi & UKM Purbalingga
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-[50%] flex flex-col items-center justify-center p-8 sm:p-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[480px] relative z-10"
        >
          <div className="lg:hidden flex justify-center mb-12">
            <Link href="/" className="flex flex-col items-center gap-2">
              <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-2xl">
                <MapPin size={32} />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 uppercase">Purbalingga</span>
            </Link>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest mb-4">
              <Plus className="w-4 h-4" />
              <span>Create Account</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Daftar Pelaku UMKM.</h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">Lengkapi formulir di bawah ini untuk memulai akses portal Anda.</p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <Label htmlFor="fullName" className="text-slate-800 font-bold text-sm ml-1">Nama Lengkap Sesuai KTP</Label>
                <Input 
                  id="fullName" 
                  type="text" 
                  placeholder="Budi Santoso" 
                  required 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-14 bg-white border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all rounded-2xl px-5 text-base font-medium shadow-sm"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-slate-800 font-bold text-sm ml-1">Alamat Email Aktif</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="nama@email.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 bg-white border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all rounded-2xl px-5 text-base font-medium shadow-sm"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" strokeWidth={1.5} className="text-slate-800 font-bold text-sm ml-1">Kata Sandi Akun</Label>
                <div className="relative group">
                  <Input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    placeholder="Minimal 6 karakter unik"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 bg-white border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all rounded-2xl px-5 text-base font-medium shadow-sm pr-14"
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
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 shadow-sm"
              >
                {error}
              </motion.div>
            )}

            <Button className="w-full h-14 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 transition-all mt-4" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Processing...
                </>
              ) : (
                'Buat Akun Sekarang'
              )}
            </Button>
          </form>
          
          <div className="mt-10 text-center">
            <p className="text-slate-500 text-sm font-medium mb-1">Sudah memiliki akun terdaftar?</p>
            <Link href="/login" className="text-blue-600 font-black text-base hover:text-blue-700 transition-all">
              Masuk ke Akun &rarr;
            </Link>
          </div>

          <div className="mt-12 flex justify-center">
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
