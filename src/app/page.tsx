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
  Box
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
              className="rounded-full bg-[#0F172A] px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105 shadow-lg shadow-slate-900/20"
            >
              Start Chatting
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
              Ordinary language in.
              <br />
              <span className="text-[#00A3FF]">Technical language out.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mx-auto max-w-2xl text-pretty text-lg font-medium leading-relaxed text-slate-600 sm:text-xl mb-12"
            >
              GRAMMAR is the execution engine for translating human intent into governed, multi-role technical execution. 
              Orchestrate agents, sync Deep Research, and ship production-ready context.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col items-center justify-center gap-6 sm:flex-row"
            >
              <Link 
                href="/chat/acheevy"
                className="group relative inline-flex items-center gap-3 rounded-full bg-[#00A3FF] px-10 py-5 text-lg font-bold text-white shadow-xl shadow-[#00A3FF44] transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                <span className="relative z-10 flex items-center gap-3">
                  Launch ACHEEVY
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="/research"
                className="inline-flex items-center gap-3 rounded-full border border-slate-300 bg-white px-10 py-5 text-lg font-bold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 active:scale-95 shadow-sm"
              >
                Researcher Hub
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Roles Section */}
        <section id="roles" className="py-24 bg-white border-y border-slate-200 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  id: 'acheevy',
                  icon: Network,
                  title: 'ACHEEVY',
                  role: 'The Orchestrator',
                  desc: 'Sequences tasks, manages checkpoints, and maintains the overall board state. ACHEEVY ensures parallel agent work remains aligned with your objective.',
                  color: 'bg-slate-900',
                  accent: 'text-slate-500'
                },
                {
                  id: 'mim',
                  icon: ShieldCheck,
                  title: 'MIM',
                  role: 'Governance Layer',
                  desc: 'Governs context, revisions, and distribution. Not an agent, but a law-driven framework that enforces technical constraints and quality standards.',
                  color: 'bg-[#00A3FF]',
                  accent: 'text-[#00A3FF]'
                },
                {
                  id: 'boomer_angs',
                  icon: Cpu,
                  title: 'Boomer_Angs',
                  role: 'Execution Roles',
                  desc: 'Specialized agents acting on governed context. Whether researching, coding, or optimizing, Boomer_Angs execute the technical heavy lifting.',
                  color: 'bg-emerald-500',
                  accent: 'text-emerald-600'
                }
              ].map((role, i) => (
                <motion.div 
                  key={role.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  className="space-y-6 group p-8 rounded-[2.5rem] hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={twMerge("w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200", role.color)}
                  >
                    <role.icon className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-2xl font-black tracking-tight text-slate-900">{role.title}</h3>
                  <p className={twMerge("text-xs font-black leading-relaxed uppercase tracking-[0.2em]", role.accent)}>{role.role}</p>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {role.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Architecture Spotlight */}
        <section id="architecture" className="py-32 bg-[#F9FAFB] relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden border border-slate-800 shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#00A3FF11] to-transparent pointer-events-none" />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-10">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00A3FF]">Proprietary Stack</span>
                    <h2 className="text-4xl lg:text-5xl font-black tracking-tight mt-4">Vision-First,<br />API-Driven Intelligence.</h2>
                  </motion.div>
                  
                  <div className="space-y-6">
                    {[
                      { icon: Zap, title: "Deep Research Integration", desc: "Direct bridge to NotebookLM-backed context packs and multimodal vector indexing." },
                      { icon: Activity, title: "Real-time Trace Layers", desc: "Every intent is normalized, recorded, and verifiable through evidence-backed response generation." },
                      { icon: Box, title: "Modular Packaging", desc: "Outcome bundles including manifests, retrieval paths, and approval states for seamless handoff." }
                    ].map((item, i) => (
                      <motion.div 
                        key={item.title}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 + (i * 0.1) }}
                        className="flex gap-4"
                      >
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                          <item.icon className="w-5 h-5 text-[#00A3FF]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm uppercase tracking-widest text-white mb-2">{item.title}</h4>
                          <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="relative aspect-square lg:aspect-auto lg:h-[500px] bg-white/5 rounded-[2rem] border border-white/10 p-8 shadow-inner overflow-hidden">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,163,255,0.05),transparent_70%)]" />
                   <div className="relative h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-2xl">
                      <Cpu className="w-20 h-20 text-[#00A3FF] mb-6 animate-pulse" />
                      <div className="space-y-2">
                        <p className="text-xs font-mono text-[#00A3FF] tracking-tighter">ENGINE_STATE: ACTIVE</p>
                        <p className="text-xl font-bold tracking-tight">Technical Language Index</p>
                        <p className="text-xs text-slate-500 font-medium">Ready for multimodal ingestion.</p>
                      </div>
                      
                      <div className="absolute bottom-8 inset-x-8">
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-[#00A3FF] w-2/3" />
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] font-mono text-slate-500">
                          <span>SYNCING...</span>
                          <span>67%</span>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <Image src="/grammar-logo-transparent.svg" alt="GRAMMAR" width={140} height={32} className="h-8 w-auto opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
            
            <div className="flex gap-12 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              <Link href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">Contact</Link>
            </div>

            <div className="text-xs font-mono text-slate-400 font-bold tracking-wider">
              SYS.v0.1.0 // ACTIVE
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
