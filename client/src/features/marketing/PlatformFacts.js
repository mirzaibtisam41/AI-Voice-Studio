'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { usePublicPlatformQuery } from '@/features/marketing/platformApi';

const NUMBER_FORMAT = new Intl.NumberFormat('en-US');

export function useSignupCredits() {
  const { data } = usePublicPlatformQuery();

  return data?.settings?.signupCredits ?? null;
}

export function SignupCreditsText({ template, fallback }) {
  const signupCredits = useSignupCredits();

  if (!signupCredits) return fallback;

  return template.replace('{credits}', NUMBER_FORMAT.format(signupCredits));
}

function heroFacts(settings) {
  return [
    { value: settings.signupCredits, label: 'free credits' },
    { value: settings.ttsMaxCharacters, label: 'characters per clip' },
    { value: settings.uploadMaxMegabytes, suffix: ' MB', label: 'uploads' },
    {
      value: settings.realtimeMaxMinutes,
      suffix: ' min',
      label: 'live conversations',
    },
  ].filter((fact) => Number.isFinite(fact.value) && fact.value > 0);
}

export function HeroStats() {
  const { data, isLoading } = usePublicPlatformQuery();
  const facts = data?.settings ? heroFacts(data.settings) : [];

  if (!isLoading && facts.length === 0) return null;

  return (
    <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-6 sm:grid-cols-4">
      {isLoading
        ? [0, 1, 2, 3].map((index) => (
            <div key={index} className="flex flex-col gap-1.5">
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))
        : facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-0.5">
              <dt className="order-2 text-[12px] text-ink-3">{fact.label}</dt>
              <dd className="order-1 font-mono text-[17px] font-medium">
                {NUMBER_FORMAT.format(fact.value)}
                {fact.suffix ?? ''}
              </dd>
            </div>
          ))}
    </dl>
  );
}
