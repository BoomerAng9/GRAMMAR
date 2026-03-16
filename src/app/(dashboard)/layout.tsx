/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Settings,
  Users, 
  BrainCircuit, 
  ShieldCheck, 
  Terminal, 
  FlaskConical, 
  MessageSquare,
  Activity,
  Cpu,
  LogOut,
  ChevronRight,
  Bell
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/hooks/useAuth';
import { useWhiteLabel } from '@/hooks/useWhiteLabel';
import { AuthPromptTimer } from '@/components/auth/AuthPromptTimer';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function UserDropdown() {
  const { profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!profile) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
      >
        <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm overflow-hidden">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            profile.display_name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="hidden lg:block text-left">
          <p className="text-xs font-bold text-slate-900 leading-none">{profile.display_name}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={cn(
              "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
              profile.tier === 'free' ? "bg-slate-100 text-slate-500" :
              profile.tier === 'pro' ? "bg-[#00A3FF1A] text-[#00A3FF]" : "bg-amber-100 text-amber-600"
            )}>
              {profile.tier}
            </span>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 overflow-hidden ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <p className="text-xs font-bold text-slate-900 leading-none mb-1">{profile.display_name}</p>
            <p className="text-[10px] text-slate-500 font-medium truncate">User ID: {profile.user_id.slice(0, 8)}...</p>
          </div>
          
          <div className="py-1">
            <Link 
              href="/settings" 
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              Account Settings
            </Link>
            <Link 
              href="/pricing" 
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Billing & Subscription
            </Link>
          </div>

          <div className="h-px bg-slate-100 my-1" />
          
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { config } = useWhiteLabel();
  const [isQuickPanelOpen, setIsQuickPanelOpen] = useState(false);

  const navItems = [
    { name: 'Board', href: '/board', icon: LayoutDashboard },
    { name: 'System Manager', href: '/manager', icon: Settings },
    { name: 'Agents', href: '/agents', icon: Users },
    { name: 'Memory', href: '/memory', icon: BrainCircuit },
    { name: 'Policies', href: '/policies', icon: ShieldCheck },
    { name: 'Logs', href: '/logs', icon: Terminal },
    { name: 'Research Lab', href: '/research', icon: FlaskConical },
    { name: 'Chat w/ACHEEVY', href: '/chat/acheevy', icon: MessageSquare },
    { name: 'LibreChat', href: '/chat/librechat', icon: MessageSquare },
  ];

  return (
        <div className="flex h-screen bg-[#F9FAFB] text-slate-900 font-sans antialiased overflow-hidden">
        <AuthPromptTimer />
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col z-20">
          <div className="p-6">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image 
                src="/grammar-logo-on-white.svg" 
                alt="GRAMMAR Logo" 
                className="w-auto h-7 object-contain"
                width={120}
                height={32}
                priority
              />
            </Link>
          </div>
    <div className="flex h-screen bg-[#F9FAFB] text-slate-900 font-sans antialiased overflow-hidden">
      <AuthPromptTimer />
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E5E7EB] flex-col z-20">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image 
              src="/grammar-logo-on-white.svg" 
              alt="GRAMMAR Logo" 
              className="w-auto h-7 object-contain"
              width={120}
              height={32}
              priority
            />
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/board' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.name + item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium",
                  isActive 
                    ? "text-white" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
                style={isActive ? { backgroundColor: config.primaryColor } : {}}
              >
                <item.icon className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System State</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600">LIVE</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">MIM Governance</span>
                <span className="text-slate-900 font-mono">OK</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">TLI Sync</span>
                <span className="text-slate-900 font-mono">100%</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 px-1 hover:text-slate-600 transition-colors cursor-pointer">GRAMMAR</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-900 font-semibold px-1">
              {navItems.find(item => item.href === pathname)?.name || 
               (pathname === '/settings' ? 'Settings' : 
                pathname === '/pricing' ? 'Subscription' : 'Dashboard')}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 uppercase tracking-tighter">RAM:</span>
                <span className="text-slate-900 font-semibold tracking-tighter">4.2GB / 16GB</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 uppercase tracking-tighter">Latency:</span>
                <span className="text-slate-900 font-semibold tracking-tighter">42ms</span>
              </div>
            </div>
            
            <div className="h-4 w-px bg-slate-200" />
            
            <button className="relative text-slate-400 hover:text-slate-600">
              <Bell className="w-5 h-5" />
              <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
            </button>

            <UserDropdown />
          </div>
        </header>

        {/* Page Container */}
        <div className="flex-1 overflow-auto p-8 relative">
          {children}
        </div>

        {/* Quick Panel - Floating Context */}
        <div className="absolute bottom-8 right-8 z-50 flex flex-col items-end gap-4">
          {isQuickPanelOpen && (
            <div className="w-80 bg-white border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 ring-1 ring-black/5">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">CHAT w/ACHEEVY</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsQuickPanelOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </button>
              </div>

              <div className="flex-1 p-4 space-y-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Live Events</p>
                  <div className="space-y-1">
                    {[
                      { event: "TLI: New Source Indexed", time: "14:42:10" },
                      { event: "BuildSmith: Deploying v1.2", time: "14:40:05" },
                      { event: "MIM: Policy Check Passed", time: "14:38:22" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50/50 transition-colors group">
                        <span className="text-xs text-slate-600 font-medium">{item.event}</span>
                        <span className="text-[10px] text-slate-400 font-mono group-hover:text-slate-500">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-3">
                <Link 
                  href="/chat/acheevy"
                  className="flex items-center justify-center gap-2 w-full bg-[#00A3FF] hover:bg-[#0089D9] text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-[#00A3FF33] active:scale-[0.98]"
                >
                  <MessageSquare className="w-4 h-4" />
                  OPEN FULL CHAT
                </Link>
                
                <div className="grid grid-cols-4 gap-2">
                  {navItems.slice(0, 4).map((item, i) => (
                    <Link 
                      key={i}
                      href={item.href}
                      className="flex items-center justify-center h-10 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-[#00A3FF] hover:border-[#0089D933] transition-all shadow-sm"
                    >
                      <item.icon className="w-4 h-4" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Floating Bubble */}
          <button 
            onClick={() => setIsQuickPanelOpen(!isQuickPanelOpen)}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl active:scale-[0.9] hover:scale-110 relative group border-0 focus:outline-none",
              isQuickPanelOpen ? "bg-slate-900" : "bg-[#00A3FF] shadow-[#00A3FF44]"
            )}
          >
            <BrainCircuit className="w-8 h-8 text-white" />
            <div className="absolute inset-x-full left-auto pr-6 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap">
               <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl">
                 Chat w/ACHEEVY
               </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
