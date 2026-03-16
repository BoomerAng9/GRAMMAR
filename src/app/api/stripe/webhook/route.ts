import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

/**
 * POST /api/stripe/webhook
 * 
 * Handles Stripe webhook events for subscription lifecycle management.
 * This route processes events from Stripe and updates the InsForge database accordingly.
 * 
 * Required env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 */
export async function POST(request: NextRequest) {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    console.error('[Stripe Webhook] Missing Stripe environment variables');
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' });

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signature verification failed';
    console.error(`[Stripe Webhook] Signature verification failed: ${message}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const eventType = event.type;
  const data = event.data?.object as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

  console.log(`[Stripe Webhook] Received event: ${eventType}`);

  // Import InsForge admin client for server-side operations
  const { createClient } = await import('@insforge/sdk');
  const adminClient = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
  });

  try {
    switch (eventType) {
      // ── Checkout completed (new subscription) ──────────
      case 'checkout.session.completed': {
        const customerId = data.customer;
        const subscriptionId = data.subscription;
        const userId = data.metadata?.user_id;

        if (!userId) {
          console.error('[Stripe] No user_id in checkout metadata');
          break;
        }

        // Determine plan from price
        const plan = determinePlan(data.metadata?.price_id);

        // Update profile with Stripe customer ID
        await adminClient.database
          .from('profiles')
          .update({ stripe_customer_id: customerId, tier: plan })
          .eq('user_id', userId);

        // Update subscription
        await adminClient.database
          .from('subscriptions')
          .update({
            stripe_subscription_id: subscriptionId,
            stripe_price_id: data.metadata?.price_id,
            plan,
            status: 'active',
            current_period_start: new Date(data.created * 1000).toISOString(),
            current_period_end: new Date(data.expires_at ? data.expires_at * 1000 : Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('user_id', userId);

        console.log(`[Stripe] User ${userId} upgraded to ${plan}`);
        break;
      }

      // ── Subscription updated ───────────────────────────
      case 'customer.subscription.updated': {
        const subId = data.id;
        const status = mapStripeStatus(data.status);
        const plan = determinePlanFromPriceId(data.items?.data?.[0]?.price?.id);

        await adminClient.database
          .from('subscriptions')
          .update({
            status,
            plan,
            cancel_at_period_end: data.cancel_at_period_end || false,
            current_period_start: new Date(data.current_period_start * 1000).toISOString(),
            current_period_end: new Date(data.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subId);

        // Also update profile tier
        const { data: sub } = await adminClient.database
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subId)
          .single();
        
        if (sub) {
          await adminClient.database
            .from('profiles')
            .update({ tier: plan })
            .eq('user_id', sub.user_id);
        }

        console.log(`[Stripe] Subscription ${subId} updated to ${plan} (${status})`);
        break;
      }

      // ── Subscription canceled ──────────────────────────
      case 'customer.subscription.deleted': {
        const subId = data.id;

        await adminClient.database
          .from('subscriptions')
          .update({
            status: 'canceled',
            plan: 'free',
          })
          .eq('stripe_subscription_id', subId);

        const { data: sub } = await adminClient.database
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subId)
          .single();

        if (sub) {
          await adminClient.database
            .from('profiles')
            .update({ tier: 'free' })
            .eq('user_id', sub.user_id);
        }

        console.log(`[Stripe] Subscription ${subId} canceled, downgraded to free`);
        break;
      }

      // ── Invoice payment failed ─────────────────────────
      case 'invoice.payment_failed': {
        const subId = data.subscription;
        if (subId) {
          await adminClient.database
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subId);
        }
        console.log(`[Stripe] Payment failed for subscription ${subId}`);
        break;
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Stripe Webhook] Processing error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// ─── Helpers ────────────────────────────────────────────────

function determinePlan(priceId?: string): string {
  // Map Stripe price IDs to plan names
  // These should match your Stripe dashboard
  if (!priceId) return 'pro';
  if (priceId.includes('enterprise')) return 'enterprise';
  return 'pro';
}

function determinePlanFromPriceId(priceId?: string): string {
  return determinePlan(priceId);
}

function mapStripeStatus(stripeStatus: string): string {
  const map: Record<string, string> = {
    active: 'active',
    canceled: 'canceled',
    past_due: 'past_due',
    trialing: 'trialing',
    incomplete: 'incomplete',
    incomplete_expired: 'canceled',
    unpaid: 'past_due',
  };
  return map[stripeStatus] || 'active';
}
