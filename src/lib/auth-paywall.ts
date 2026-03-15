import { insforge } from './insforge';

// ─── Types ────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  role: 'user' | 'admin' | 'operator';
  tier: 'free' | 'pro' | 'enterprise';
  stripe_customer_id: string | null;
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

export interface PlanFeature {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  priceId: string | null;
}

export const PLAN_CONFIG: Record<string, PlanFeature> = {
  free: {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    features: [
      '3 TLI Data Sources',
      '10 Research Queries / day',
      '1 Agent Instance',
      '50 MB Storage',
    ],
    cta: 'Current Plan',
    priceId: null,
  },
  pro: {
    name: 'Pro',
    price: '$29',
    period: '/month',
    features: [
      '50 TLI Data Sources',
      '500 Research Queries / day',
      '10 Agent Instances',
      '5 GB Storage',
      'Deep Research Mode',
      'Custom Model Selection',
    ],
    cta: 'Upgrade to Pro',
    highlight: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro_default',
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited Sources',
      'Unlimited Queries',
      'Unlimited Agents',
      'Unlimited Storage',
      'Deep Research Mode',
      'Custom Models',
      'Priority Support',
      'SLA Guarantee',
    ],
    cta: 'Contact Sales',
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_default',
  },
};

// ─── Auth Service ─────────────────────────────────────────

export const authService = {
  /**
   * Sign up with email/password
   */
  async signUp(email: string, password: string, displayName?: string) {
    if (!insforge) throw new Error('InsForge client not initialized');
    
    const { data, error } = await (insforge.auth as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).signUp({
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

    return data;
  },

  /**
   * Sign in with email/password
   */
  async signIn(email: string, password: string) {
    if (!insforge) throw new Error('InsForge client not initialized');
    const { data, error } = await insforge.auth.signInWithPassword({ email, password });
    if (error) throw error;
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
   * Get user profile with subscription
   */
  async getProfile(userId: string): Promise<{ profile: UserProfile | null; subscription: Subscription | null }> {
    if (!insforge) return { profile: null, subscription: null };

    const [profileRes, subRes] = await Promise.all([
      insforge.database.from('profiles').select('*').eq('user_id', userId).single(),
      insforge.database.from('subscriptions').select('*').eq('user_id', userId).single(),
    ]);

    return {
      profile: profileRes.data as UserProfile | null,
      subscription: subRes.data as Subscription | null,
    };
  },

  /**
   * Update profile
   */
  async updateProfile(userId: string, updates: Partial<Pick<UserProfile, 'display_name' | 'avatar_url'>>) {
    if (!insforge) throw new Error('InsForge client not initialized');
    const { data, error } = await insforge.database
      .from('profiles')
      .update(updates)
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },
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
};
