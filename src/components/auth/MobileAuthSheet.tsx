'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, X, Eye, EyeOff } from 'lucide-react';

interface MobileAuthSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function MobileAuthSheet({ isOpen, onClose, initialMode = 'login' }: MobileAuthSheetProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Reset form when opened with a new mode
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setEmail('');
      setPassword('');
      setFullName('');
    }
  }, [isOpen, initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
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
      } else {
        // Register flow
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'pemilik_umkm',
            },
          },
        });

        if (error) {
          setError(error.message);
          setIsLoading(false);
          return;
        }
      }

      onClose();
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err?.message || 'Terjadi kesalahan. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] md:hidden"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white z-[120] rounded-t-[32px] md:hidden shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col max-h-[90dvh]"
          >
            {/* Handle & Header */}
            <div className="relative flex flex-col items-center pt-4 pb-2 px-6 shrink-0">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-6" />
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
              
              <h2 className="text-[26px] font-heading font-bold text-slate-900 tracking-tight mb-2">
                {mode === 'login' ? 'Masuk atau daftar' : 'Buat akun baru'}
              </h2>
              <p className="text-[13px] text-slate-500 text-center max-w-[280px] leading-relaxed font-medium">
                Anda akan mendapatkan akses penuh untuk mengelola dan mengembangkan UMKM Anda.
              </p>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 pb-12">
              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'register' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="auth-fullname" className="text-slate-700 font-semibold text-[13px] ml-1">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="auth-fullname"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-[52px] bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl px-5 text-[15px] transition-all shadow-sm"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="auth-email" className="text-slate-700 font-semibold text-[13px] ml-1">
                    Alamat Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-[52px] bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl px-5 text-[15px] transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="auth-password" className="text-slate-700 font-semibold text-[13px]">
                      Kata Sandi <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <div className="relative group">
                    <Input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-[52px] bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl px-5 text-[15px] transition-all shadow-sm pr-14"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-500/10 text-red-400 text-sm font-medium rounded-2xl border border-red-500/20 flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    {error}
                  </motion.div>
                )}

                <Button 
                  className="w-full h-[52px] bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-[16px] shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] mt-4" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    mode === 'login' ? 'Lanjutkan' : 'Daftar Sekarang'
                  )}
                </Button>
              </form>

              <div className="mt-8 relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200"></span>
                </div>
                <div className="relative flex justify-center text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  <span className="bg-white px-4">ATAU</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                {mode === 'login' ? (
                  <button 
                    type="button"
                    onClick={() => { setMode('register'); setError(null); }}
                    className="text-[14px] text-slate-600 font-medium"
                  >
                    Belum punya akun? <span className="text-blue-600 font-bold underline decoration-blue-600/30 underline-offset-4 hover:text-blue-700 hover:decoration-blue-700/50 transition-colors">Daftar sekarang</span>
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className="text-[14px] text-slate-600 font-medium"
                  >
                    Sudah punya akun? <span className="text-blue-600 font-bold underline decoration-blue-600/30 underline-offset-4 hover:text-blue-700 hover:decoration-blue-700/50 transition-colors">Masuk di sini</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
