import { insforge } from './insforge';
export { PLAN_CONFIG, type PlanFeature } from '@/lib/billing/plans';

// ─── Types ────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  role: 'user' | 'admin' | 'operator';
  tier: 'free' | 'pro' | 'enterprise';
  stripe_customer_id: string | null;
  default_org_id: string | null;
  created_at: string;
}


export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface TierLimits {
  max_sources: number;
  max_research_queries_per_day: number;
  max_agents: number;
  max_storage_mb: number;
  deep_research: boolean;
  custom_models: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface MIMPolicy {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  type: 'technical' | 'operational' | 'security';
  rules: unknown[];
  is_active: boolean;
  created_at: string;
}

interface AuthUserLike {
  email?: string;
  metadata?: {
    name?: string;
  };
}

interface SignUpResponse {
  data?: {
    user?: {
      id: string;
    };
  };
  error?: {
    message?: string;
  } | null;
}

interface PolicyMutationResult<T> {
  data: T | null;
  error: unknown;
}

function getAccessTokenFromSession(
  session: { accessToken?: string; access_token?: string } | null | undefined,
) {
  if (!session) {
    return null;
  }

  return session.accessToken || session.access_token || null;
}

async function syncServerSessionCookie(accessToken: string | null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!accessToken) {
    return;
  }

  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error || 'Failed to persist auth session.');
  }
}

// ─── Auth Service ─────────────────────────────────────────

export const authService = {
  /**
   * Sign up with email/password
   */
  async signUp(email: string, password: string, displayName?: string) {
    if (!insforge) throw new Error('InsForge client not initialized');

    const signUp = (insforge.auth as unknown as { signUp: (payload: {
      email: string;
      password: string;
      options: { data: { name: string } };
    }) => Promise<SignUpResponse> }).signUp;

    const { data, error } = await signUp({
      email,
      password,
      options: { data: { name: displayName || email.split('@')[0] } }
    });
    
    if (error) throw error;

    // Create profile manually (trigger on auth.users isn't possible via API)
    if (data?.user) {
      await insforge.database.from('profiles').insert([{
        user_id: data.user.id,
        display_name: displayName || email.split('@')[0],
        role: 'user',
        tier: 'free',
      }]);

      await insforge.database.from('subscriptions').insert([{
        user_id: data.user.id,
        plan: 'free',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      }]);
    }

    const { data: currentSession } = await insforge.auth.getCurrentSession();
    await syncServerSessionCookie(getAccessTokenFromSession(currentSession?.session));

    return data;
  },

  /**
   * Sign in with email/password
   */
  async signIn(email: string, password: string) {
    if (!insforge) throw new Error('InsForge client not initialized');
    const { data, error } = await insforge.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const accessToken = getAccessTokenFromSession(data as { accessToken?: string; access_token?: string } | null)
      || getAccessTokenFromSession((await insforge.auth.getCurrentSession()).data?.session);
    await syncServerSessionCookie(accessToken);
    return data;
  },

  /**
   * Sign in with OAuth (Google/GitHub)
   */
  async signInWithOAuth(provider: 'google' | 'github') {
    if (!insforge) throw new Error('InsForge client not initialized');
    const { data, error } = await insforge.auth.signInWithOAuth({
      provider,
      redirectTo: `${window.location.origin}/auth/callback`
    });
    if (error) throw error;
    return data;
  },

  /**
   * Sign out
   */
  async signOut() {
    if (!insforge) throw new Error('InsForge client not initialized');
    const { error } = await insforge.auth.signOut();
    if (error) throw error;
    if (typeof window !== 'undefined') {
      await fetch('/api/auth/session', { method: 'DELETE' });
    }
  },

  /**
   * Get current session
   */
  async getSession() {
    if (!insforge) return null;
    const { data } = await insforge.auth.getCurrentSession();
    return data?.session ?? null;
  },

  /**
   * Get user profile with subscription, auto-creating if missing
   */
  async getProfile(userId: string): Promise<{ profile: UserProfile | null; subscription: Subscription | null }> {
    if (!insforge) return { profile: null, subscription: null };

    const [profileRes, subRes] = await Promise.all([
      insforge.database.from('profiles').select('*').eq('user_id', userId).single(),
      insforge.database.from('subscriptions').select('*').eq('user_id', userId).single(),
    ]);

    let profile = profileRes.data as UserProfile | null;
    let subscription = subRes.data as Subscription | null;

    // Auto-create if missing (likely first OAuth login)
    if (!profile) {
      const { data: session } = await insforge.auth.getCurrentSession();
      const user = session?.session?.user as AuthUserLike | undefined;
      
      const { data: newProfile, error: pError } = await insforge.database.from('profiles').insert([{
        user_id: userId,
        display_name: user?.metadata?.name || user?.email?.split('@')[0] || 'User',
        role: 'user',
        tier: 'free',
      }]).select().single();
      
      if (!pError) profile = newProfile as UserProfile;

      const { data: newSub, error: sError } = await insforge.database.from('subscriptions').insert([{
        user_id: userId,
        plan: 'free',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      }]).select().single();

      if (!sError) subscription = newSub as Subscription;
    }

    return { profile, subscription };
  },

  /**
   * Update profile
   */
  async updateProfile(userId: string, updates: Partial<Pick<UserProfile, 'display_name' | 'avatar_url' | 'default_org_id'>>) {
    if (!insforge) throw new Error('InsForge client not initialized');
    const { error } = await insforge.database
      .from('profiles')
      .update(updates)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  },

  /**
   * Create a new organization and link the current user as owner
   */
  async createOrganization(userId: string, name: string) {
    if (!insforge) throw new Error('InsForge client not initialized');
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // 1. Create Organization
    const { data: org, error: orgError } = await insforge.database
      .from('organizations')
      .insert([{ name, slug }])
      .select()
      .single();
    
    if (orgError) throw orgError;

    // 2. Create Membership
    const { error: memError } = await insforge.database
      .from('organization_memberships')
      .insert([{
        organization_id: org.id,
        user_id: userId,
        role: 'owner'
      }]);
    
    if (memError) throw memError;

    // 3. Set as default org
    await this.updateProfile(userId, { default_org_id: org.id });

    return org;
  },

  /**
   * Get organizations for a user
   */
  async getUserOrganizations(userId: string) {
    if (!insforge) return [] as Organization[];
    
    const { data, error } = await insforge.database
      .from('organization_memberships')
      .select('organization_id, organizations(*)')
      .eq('user_id', userId);
    
    if (error) throw error;

    return ((data ?? []) as Array<{ organizations: Organization | Organization[] | null }>)
      .flatMap((membership) => {
        if (!membership.organizations) return [];
        return Array.isArray(membership.organizations)
          ? membership.organizations
          : [membership.organizations];
      });
  }
};



// ─── Paywall Service ──────────────────────────────────────

export const paywallService = {
  /**
   * Get the user's tier limits from the database function
   */
  async getTierLimits(tier: string): Promise<TierLimits> {
    if (!insforge) {
      // Return free tier defaults if client not available
      return {
        max_sources: 3,
        max_research_queries_per_day: 10,
        max_agents: 1,
        max_storage_mb: 50,
        deep_research: false,
        custom_models: false,
      };
    }

    const { data, error } = await insforge.database.rpc('get_tier_limits', { user_tier: tier });
    if (error) throw error;
    return data as TierLimits;
  },

  /**
   * Check if a user has permission for a specific action
   */
  async checkAccess(userId: string, feature: keyof TierLimits): Promise<boolean> {
    if (!insforge) return false;

    const { data: profile } = await insforge.database
      .from('profiles')
      .select('tier')
      .eq('user_id', userId)
      .single();

    if (!profile) return false;

    const limits = await this.getTierLimits(profile.tier);
    const limit = limits[feature];
    
    // Booleans: direct check
    if (typeof limit === 'boolean') return limit;
    
    // Numbers: -1 means unlimited, otherwise check usage
    if (typeof limit === 'number') {
      if (limit === -1) return true;
      // Could check usage_tracking here for quota enforcement
      return true; // Simplified: always allow if tier permits
    }

    return false;
  },

  /**
   * Track usage for a metric
   */
  async trackUsage(userId: string, metric: string, amount: number = 1) {
    if (!insforge) return;
    await insforge.database.rpc('increment_usage', {
      p_user_id: userId,
      p_metric: metric,
      p_amount: amount,
    });
  },

  /**
   * Get current usage for a user
   */
  async getUsage(userId: string) {
    if (!insforge) return [];
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data, error } = await insforge.database
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('period_start', periodStart);

    if (error) throw error;
    return data;
  },

  async getPolicies(orgId: string): Promise<PolicyMutationResult<MIMPolicy[]>> {
    if (!insforge) return { data: null, error: 'InsForge client not initialized' };
    const { data, error } = await insforge.database.from('policies')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createPolicy(policy: Omit<MIMPolicy, 'id' | 'created_at'>): Promise<PolicyMutationResult<MIMPolicy>> {
    if (!insforge) return { data: null, error: 'InsForge client not initialized' };
    const { data, error } = await insforge.database.from('policies')
      .insert([policy])
      .select()
      .single();
    return { data, error };
  },

  async updatePolicy(id: string, updates: Partial<MIMPolicy>): Promise<PolicyMutationResult<MIMPolicy>> {
    if (!insforge) return { data: null, error: 'InsForge client not initialized' };
    const { data, error } = await insforge.database.from('policies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }
};
