'use client';

import { useState } from 'react';
import { Check, Zap, Shield, Crown, ArrowLeft } from 'lucide-react';
import { PLAN_CONFIG } from '@/lib/auth-paywall';
import Link from 'next/link';

const ICONS: Record<string, typeof Zap> = {
  free: Shield,
  pro: Zap,
  enterprise: Crown,
};

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-4">
        <Link 
          href="/board" 
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Upgrade your Circuit Box
          </h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Unlock more research sources, agent instances, and deep research capabilities. 
            Scale from prototyping to production.
          </p>

          {/* Billing Toggle */}
          <div className="mt-6 inline-flex items-center gap-3 bg-white border border-slate-200 rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                !annual ? 'bg-[#0F172A] text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                annual ? 'bg-[#0F172A] text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Annual
              <span className="ml-1.5 text-emerald-500 font-semibold">-20%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.entries(PLAN_CONFIG) as [string, typeof PLAN_CONFIG['free']][]).map(([key, plan]) => {
            const Icon = ICONS[key] || Shield;
            const isHighlight = 'highlight' in plan && plan.highlight;
            
            const price = key === 'pro' && annual ? '$23' : plan.price;
            const period = key === 'enterprise' ? '' : annual && key === 'pro' ? '/mo' : plan.period;

            return (
              <div
                key={key}
                className={`relative rounded-2xl border p-8 flex flex-col transition-all hover:shadow-lg ${
                  isHighlight 
                    ? 'border-[#00A3FF] bg-white shadow-md ring-1 ring-[#00A3FF]/20' 
                    : 'border-slate-200 bg-white'
                }`}
              >
                {isHighlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#00A3FF] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                    isHighlight ? 'bg-[#00A3FF]/10' : 'bg-slate-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${isHighlight ? 'text-[#00A3FF]' : 'text-slate-500'}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900">{price}</span>
                    {period && <span className="text-sm text-slate-500">{period}</span>}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        isHighlight ? 'text-[#00A3FF]' : 'text-emerald-500'
                      }`} />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className={`w-full h-11 rounded-xl text-sm font-semibold transition-all ${
                    isHighlight
                      ? 'bg-[#00A3FF] text-white hover:bg-[#0089D9]'
                      : key === 'enterprise'
                        ? 'bg-[#0F172A] text-white hover:bg-[#1E293B]'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-10 text-xs text-slate-400">
          All plans include SSL encryption, SOC 2 compliance, and 99.9% uptime SLA.
          <br />
          Enterprise plans include dedicated support and custom SLA terms.
        </div>
      </div>
    </div>
  );
}
