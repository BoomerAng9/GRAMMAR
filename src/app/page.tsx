'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { 
  ChevronRight, 
  ShieldCheck, 
  Cpu, 
  Network, 
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  Box,
  Gavel,
  Database,
  Search,
  Code2
} from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 selection:bg-slate-200 selection:text-slate-900 font-sans overflow-x-hidden">
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 lg:px-12">
          <Link href="/" className="inline-flex items-center" aria-label="GRAMMAR Home">
            <Image src="/grammar-logo-transparent.svg" alt="GRAMMAR" width={180} height={40} className="h-10 w-auto" priority />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#architecture" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">Architecture</Link>
            <Link href="#roles" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">Roles</Link>
            <Link href="/pricing" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:text-slate-900"
            >
              Sign In
            </Link>
            <Link
              href="/chat/acheevy"
              className="rounded-2xl bg-[#0F172A] px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105 shadow-lg shadow-slate-900/20"
            >
              Start Build
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative">
        <section className="relative overflow-hidden pt-20 pb-32">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,rgba(0,163,255,0.15),transparent_70%)]" 
          />
          
          <div className="mx-auto max-w-7xl px-6 lg:px-12 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-12"
            >
              <Sparkles className="w-4 h-4 text-[#00A3FF]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">v1.0-RC // ACTIVE RUNTIME</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-balance text-6xl font-black leading-[0.9] tracking-[-.04em] text-slate-900 sm:text-7xl lg:text-8xl mb-8"
            >
              Human intent into.
              <br />
              <span className="text-[#00A3FF]">Governed execution.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mx-auto max-w-2xl text-pretty text-lg font-medium leading-relaxed text-slate-600 sm:text-xl mb-12"
            >
              GRAMMAR is an API-first, vision-first action runtime. We interpret, structure, route, coordinate, and package work through a governed multi-role ecosystem.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/chat/acheevy"
                className="w-full sm:w-auto rounded-2xl bg-[#0F172A] px-10 py-5 text-base font-black text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3"
              >
                Launch Runtime
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#architecture"
                className="w-full sm:w-auto rounded-2xl bg-white border border-slate-200 px-10 py-5 text-base font-black text-slate-900 transition-all hover:bg-slate-50 flex items-center justify-center gap-3"
              >
                Full Manifest
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid - Core Runtime */}
        <section id="architecture" className="py-24 bg-white border-y border-slate-100">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl mb-4">Core Runtime Infrastructure</h2>
              <p className="text-slate-500 font-medium">The governed engines that drive GRAMMAR's autonomous orchestration.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-slate-50/50 border border-slate-100 hover:border-[#00A3FF33] transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-[#00A3FF]">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">NTNTN Framing</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Frames and normalizes human intent into objective, governed context maps. No guesses, just objective structure from the first prompt.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50/50 border border-slate-100 hover:border-[#00A3FF33] transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-[#00A3FF]">
                  <Gavel className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">MIM Governance</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Memory, Intent, and Manifest discipline. Not an agent, but a structural law that ensures every action is traceable, indexed, and compliant.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50/50 border border-slate-100 hover:border-[#00A3FF33] transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-[#00A3FF]">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">ACHEEVY Orchestration</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Dynamic sequencing, checkpoints, and huddles. ACHEEVY coordinates parallel execution branches into high-fidelity unified outcomes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section id="roles" className="py-24 bg-slate-50 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00A3FF1A] text-[#00A3FF] mb-6">
                  <Database className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Execution Branches</span>
                </div>
                <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1]">Specialized roles for every capability class.</h2>
                <div className="space-y-6">
                  {[
                    { icon: Search, title: 'DeerFlow', desc: 'Research-heavy search, crawl, and synthesis branches.' },
                    { icon: Code2, title: 'OpenSandbox', desc: 'Isolated code, browser, and runtime operations.' },
                    { icon: Network, title: 'Picker_Ang', desc: 'Capability-first routing based on cost, quality, and latency.' }
                  ].map((role) => (
                    <div key={role.title} className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 shrink-0">
                        <role.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{role.title}</h4>
                        <p className="text-sm text-slate-500 font-medium">{role.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 w-full max-w-lg">
                <div className="relative aspect-square bg-[#0F172A] rounded-[40px] shadow-2xl overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00A3FF33] to-transparent opacity-50" />
                   <div className="absolute inset-x-8 top-8 bottom-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="h-2 w-24 bg-white/10 rounded" />
                      <div className="h-8 w-48 bg-[#00A3FF] rounded-lg" />
                      <div className="space-y-2">
                        <div className="h-2 w-full bg-white/5 rounded" />
                        <div className="h-2 w-4/5 bg-white/5 rounded" />
                        <div className="h-2 w-3/4 bg-white/5 rounded" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-20 bg-white/5 rounded-2xl border border-white/10 p-4">
                        <div className="h-2 w-12 bg-[#00A3FF] rounded mb-2" />
                        <div className="h-4 w-16 bg-white/20 rounded" />
                      </div>
                      <div className="h-20 bg-white/5 rounded-2xl border border-white/10 p-4">
                        <div className="h-2 w-12 bg-emerald-500 rounded mb-2" />
                        <div className="h-4 w-16 bg-white/20 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-[#0F172A] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00A3FF] blur-[150px] opacity-20 -mr-48 -mt-48" />
          <div className="mx-auto max-w-7xl px-6 lg:px-12 text-center relative z-10">
            <h2 className="text-4xl font-black text-white mb-8 tracking-tight">Ready to launch your action runtime?</h2>
            <Link
              href="/chat/acheevy"
              className="inline-flex items-center gap-3 rounded-2xl bg-[#00A3FF] px-10 py-5 text-lg font-black text-white shadow-xl shadow-[#00A3FF44] transition-all hover:scale-105 active:scale-95"
            >
              Initialize GRAMMAR
              <ChevronRight className="w-6 h-6" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <Image src="/grammar-logo-transparent.svg" alt="GRAMMAR" width={140} height={32} className="h-8 w-auto opacity-50 grayscale" />
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">© 2026 ACHIEVEMOR // GRAMMAR RUNTIME</p>
        </div>
      </footer>
    </div>
  );
}
