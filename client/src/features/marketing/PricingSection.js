'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  PLANS,
  TOP_UP_PACKS,
  YEARLY_DISCOUNT,
} from '@/features/marketing/landingContent';
import {
  MarketingSection,
  SectionHeading,
} from '@/features/marketing/SectionHeading';
import { cn } from '@/lib/utils';

const BILLING_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

function planPrice(monthlyPrice, billing) {
  if (monthlyPrice === null) return 'Custom';
  if (billing === 'yearly') {
    return `$${Math.round(monthlyPrice * (1 - YEARLY_DISCOUNT))}`;
  }

  return `$${monthlyPrice}`;
}

function BillingToggle({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <div
        role="group"
        aria-label="Billing period"
        className="inline-flex rounded-full border bg-field p-1"
      >
        {BILLING_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'h-8 rounded-full px-4 text-[13px] font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
              value === option.value
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <Badge
        tone="brand"
        className={cn(
          'transition-opacity',
          value === 'yearly' ? 'opacity-100' : 'opacity-40',
        )}
      >
        Save 20%
      </Badge>
    </div>
  );
}

function PlanCard({ plan, billing }) {
  const isCustom = plan.monthlyPrice === null;
  const isPaid = !isCustom && plan.monthlyPrice > 0;

  return (
    <li
      className={cn(
        'relative flex flex-col rounded-2xl border bg-card p-6',
        plan.popular &&
          'border-brand shadow-[0_30px_80px_-40px_var(--brand-glow)]',
      )}
    >
      {plan.popular ? (
        <Badge tone="brand" className="absolute -top-2.5 left-6 bg-card px-2.5">
          Most popular
        </Badge>
      ) : null}
      <h3 className="text-[15px] font-semibold">{plan.name}</h3>
      <p className="mt-1 min-h-10 text-[13px] text-muted-foreground">
        {plan.description}
      </p>
      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="font-serif text-4xl font-medium">
          {planPrice(plan.monthlyPrice, billing)}
        </span>
        {isCustom ? null : (
          <span className="text-[13px] text-ink-3">/ month</span>
        )}
      </div>
      <p className="mt-1 h-5 text-[12px] text-ink-3">
        {isPaid && billing === 'yearly' ? 'Billed yearly' : null}
      </p>
      <p className="mt-3 font-mono text-[13px] text-brand">
        {plan.credits} {isCustom ? '' : 'credits'}
      </p>
      <ul className="mt-5 flex flex-1 flex-col gap-2.5 border-t pt-5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-[13.5px]">
            <Check
              className="mt-0.5 size-4 shrink-0 text-brand"
              aria-hidden="true"
            />
            {feature}
          </li>
        ))}
      </ul>
      <Button
        asChild
        variant={plan.popular ? 'default' : 'outline'}
        className="mt-6 w-full"
      >
        <Link href="/register">{plan.cta}</Link>
      </Button>
    </li>
  );
}

export function PricingSection() {
  const [billing, setBilling] = useState('monthly');

  return (
    <MarketingSection id="pricing" labelledBy="pricing-title">
      <SectionHeading
        id="pricing-title"
        overline="Pricing"
        title="Credits that scale with you"
        description="Start free with 10,000 credits. Upgrade when you need more, or top up any time without changing plans."
      />
      <div className="mt-8">
        <BillingToggle value={billing} onChange={setBilling} />
      </div>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <PlanCard key={plan.name} plan={plan} billing={billing} />
        ))}
      </ul>

      <div className="mt-14">
        <h3 className="text-center text-[15px] font-semibold">
          Need more? Top up anytime
        </h3>
        <p className="mt-1 text-center text-[13px] text-muted-foreground">
          One-time credit packs that never expire.
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {TOP_UP_PACKS.map((pack) => (
            <li
              key={pack.size}
              className={cn(
                'flex flex-col gap-1 rounded-2xl border bg-card p-4',
                pack.popular && 'border-brand/60',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[12px] text-ink-3">
                  Pack {pack.size}
                </span>
                {pack.popular ? <Badge tone="brand">Most popular</Badge> : null}
              </div>
              <p className="font-mono text-[15px] font-medium">
                {pack.credits}
              </p>
              <p className="text-[12px] text-ink-3">credits</p>
              <p className="mt-2 font-serif text-2xl font-medium">
                ${pack.price}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </MarketingSection>
  );
}
