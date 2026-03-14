'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService, paywallService, type UserProfile, type Subscription, type TierLimits } from '@/lib/auth-paywall';

// ─── Context Type ─────────────────────────────────────────

interface AuthContextType {
  // State
  user: any | null;
  profile: UserProfile | null;
  subscription: Subscription | null;
  tierLimits: TierLimits | null;
  loading: boolean;
  
  // Auth actions
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
  
  // Paywall helpers
  canAccess: (feature: keyof TierLimits) => boolean;
  isFeatureGated: (feature: keyof TierLimits) => boolean;
  trackUsage: (metric: string, amount?: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [tierLimits, setTierLimits] = useState<TierLimits | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      setLoading(true);
      const session = await authService.getSession();
      
      if (session?.user) {
        setUser(session.user);
        const { profile: p, subscription: s } = await authService.getProfile(session.user.id);
        setProfile(p);
        setSubscription(s);
        
        if (p) {
          const limits = await paywallService.getTierLimits(p.tier);
          setTierLimits(limits);
        }
      }
    } catch (err) {
      console.error('[Auth] Session load error:', err);
    } finally {
      setLoading(false);
    }
  }

  // ─── Auth Actions ───────────────────────────────────────

  async function signUp(email: string, password: string, displayName?: string) {
    await authService.signUp(email, password, displayName);
    await loadSession();
  }

  async function signIn(email: string, password: string) {
    await authService.signIn(email, password);
    await loadSession();
  }

  async function signInWithOAuth(provider: 'google' | 'github') {
    await authService.signInWithOAuth(provider);
    // OAuth redirects, so session loads on callback
  }

  async function signOut() {
    await authService.signOut();
    setUser(null);
    setProfile(null);
    setSubscription(null);
    setTierLimits(null);
  }

  // ─── Paywall Helpers ────────────────────────────────────

  function canAccess(feature: keyof TierLimits): boolean {
    if (!tierLimits) return false;
    const val = tierLimits[feature];
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val !== 0;
    return false;
  }

  function isFeatureGated(feature: keyof TierLimits): boolean {
    return !canAccess(feature);
  }

  async function trackUsage(metric: string, amount: number = 1) {
    if (!user) return;
    await paywallService.trackUsage(user.id, metric, amount);
  }

  // ─── Render ─────────────────────────────────────────────

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      subscription,
      tierLimits,
      loading,
      signUp,
      signIn,
      signInWithOAuth,
      signOut,
      canAccess,
      isFeatureGated,
      trackUsage,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
