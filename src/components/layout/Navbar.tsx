'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Menu, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserNav from './UserNav';
import MobileAuthSheet from '@/components/auth/MobileAuthSheet';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Peta UMKM', href: '/' },
  { name: 'Tentang Kami', href: '/about' },
  { name: 'Bantuan', href: '/help' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authSheet, setAuthSheet] = useState<'login' | 'register' | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'sticky top-0 z-[100] transition-all duration-300 border-b',
        scrolled 
          ? 'bg-white/80 backdrop-blur-md border-slate-200 py-2 shadow-sm' 
          : 'bg-white border-transparent py-4'
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/purbalinggalogo.png" 
              alt="Logo Banyumas" 
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
            />
            <div className="flex flex-col">
              <span className="font-heading font-black text-2xl tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-950 via-blue-900 to-slate-900 uppercase">
                Banyumas
              </span>
              <span className="text-[9px] font-black text-blue-600/80 uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                <span className="w-8 h-[1px] bg-blue-100" />
                Sistem Informasi UMKM
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-semibold transition-colors hover:text-blue-600',
                    pathname === link.href ? 'text-blue-600' : 'text-slate-600'
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="h-6 w-[1px] bg-slate-200 mx-2" />
            
            <UserNav />
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[90] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-[101] shadow-2xl md:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b">
                <span className="font-bold text-slate-900">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
                  <X size={20} />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                <div className="md:hidden mb-6 px-2">
                  <UserNav mobile onAuthClick={(type) => {
                    setIsOpen(false);
                    setAuthSheet(type);
                  }} />
                </div>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-2xl text-base font-semibold transition-all group',
                      pathname === link.href 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {link.name}
                    <ChevronRight size={18} className={cn(
                      'transition-transform duration-200',
                      pathname === link.href ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                    )} />
                  </Link>
                ))}
              </div>

              <div className="p-6 border-t bg-slate-50/50">
                <p className="text-xs text-slate-400 text-center font-medium">
                  © 2026 Pemerintah Kabupaten Banyumas
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Auth Sheet Pop-up */}
      <MobileAuthSheet 
        isOpen={authSheet !== null} 
        onClose={() => setAuthSheet(null)} 
        initialMode={authSheet || 'login'} 
      />
    </nav>
  );
}
