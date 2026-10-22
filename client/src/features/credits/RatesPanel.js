'use client';

import { Tags } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormAlert } from '@/components/ui/FormAlert';
import { Panel } from '@/components/ui/Panel';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRate } from '@/features/credits/capabilities';
import { useGetPublicPlatformQuery } from '@/features/credits/creditsApi';
import { getErrorMessage } from '@/lib/apiError';

export function RatesPanel() {
  const { data, isLoading, error } = useGetPublicPlatformQuery();
  const rates = data?.rates ?? [];

  return (
    <Panel
      title="What credits cost"
      description="This is a free demo. Every account gets its credits once at signup."
    >
      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}
      {isLoading ? (
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-[74px] rounded-xl" />
          ))}
        </div>
      ) : rates.length ? (
        <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
          {rates.map((rate) => (
            <li
              key={rate.capability}
              className="flex min-w-0 flex-col gap-1 rounded-xl border bg-field/60 px-4 py-3"
            >
              <span className="text-[12.5px] text-muted-foreground">
                {rate.label}
              </span>
              <span className="font-mono text-[13px] font-semibold text-brand">
                {formatRate(rate)}
              </span>
              <span
                className="truncate text-[11.5px] text-ink-3"
                title={rate.modelName}
              >
                {rate.modelName}
              </span>
            </li>
          ))}
        </ul>
      ) : error ? null : (
        <EmptyState
          icon={Tags}
          title="No rates set yet"
          description="An admin has not priced any models yet."
        />
      )}
    </Panel>
  );
}
