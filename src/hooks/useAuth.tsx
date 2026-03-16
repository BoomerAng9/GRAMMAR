'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService, paywallService, type UserProfile, type Subscription, type TierLimits } from '@/lib/auth-paywall';

// ─── Context Type ─────────────────────────────────────────

interface AuthContextType {
  // State
  user: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ | null;
  profile: UserProfile | null;
  subscription: Subscription | null;
  tierLimits: TierLimits | null;
  organization: any | null;
  organizations: any[];
  loading: boolean;
  
  // Auth actions
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
  
  // Organization actions
  createOrg: (name: string) => Promise<void>;
  switchOrg: (orgId: string) => Promise<void>;
  
  // Paywall helpers

  canAccess: (feature: keyof TierLimits) => boolean;
  isFeatureGated: (feature: keyof TierLimits) => boolean;
  trackUsage: (metric: string, amount?: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any /* eslint-disable-line @typescript-eslint/no-explicit-any */ | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [tierLimits, setTierLimits] = useState<TierLimits | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [organization, setOrganization] = useState<any | null>(null);
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

          // Load organizations
          const orgs = await authService.getUserOrganizations(session.user.id);
          setOrganizations(orgs);
          
          if (orgs.length > 0) {
            const activeOrg = orgs.find((o: any) => o.id === p.default_org_id) || orgs[0];
            setOrganization(activeOrg);
          }

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

  // ─── Organization Actions ───────────────────────────────

  async function createOrg(name: string) {
    if (!user) return;
    await authService.createOrganization(user.id, name);
    await loadSession();
  }

  async function switchOrg(orgId: string) {
    if (!user) return;
    await authService.updateProfile(user.id, { default_org_id: orgId });
    await loadSession();
  }

  // ─── Render ─────────────────────────────────────────────

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      subscription,
      tierLimits,
      organization,
      organizations,
      loading,
      signUp,
      signIn,
      signInWithOAuth,
      signOut,
      createOrg,
      switchOrg,
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
