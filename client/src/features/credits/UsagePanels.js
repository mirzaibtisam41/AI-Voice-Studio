'use client';

import { useState } from 'react';
import { PieChart } from 'lucide-react';
import { Donut, Legend, LineChart } from '@/components/charts/Charts';
import { EmptyState } from '@/components/ui/EmptyState';
import { Panel } from '@/components/ui/Panel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { CAPABILITY_COLORS } from '@/features/credits/capabilities';
import {
  USAGE_RANGES,
  buildDailyChart,
  useUsageSummary,
} from '@/features/credits/usage';

export function UsagePanels() {
  const [days, setDays] = useState(30);
  const { data: usage, isLoading } = useUsageSummary(days);
  const daily = buildDailyChart(usage?.daily);
  const byCapability = (usage?.byCapability ?? [])
    .filter((item) => item.credits > 0)
    .map((item) => ({
      label: item.label,
      value: item.credits,
      color: CAPABILITY_COLORS[item.capability] ?? 'brand',
    }));

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Panel
        title="Usage over time"
        description="Credits spent per day"
        action={
          <Select
            value={String(days)}
            onValueChange={(value) => setDays(Number(value))}
          >
            <SelectTrigger
              aria-label="Usage range"
              className="h-8 w-36 shrink-0 text-[12.5px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {USAGE_RANGES.map((range) => (
                <SelectItem key={range} value={String(range)}>
                  Last {range} days
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      >
        {isLoading ? (
          <Skeleton className="h-61 w-full" />
        ) : (
          <LineChart
            labels={daily.labels}
            series={[{ name: 'Credits', color: 'teal', values: daily.values }]}
            area
            height={220}
            label={`Credits used per day, last ${days} days`}
          />
        )}
      </Panel>

      <Panel title="Usage by feature" description={`Last ${days} days`}>
        {isLoading ? (
          <Skeleton className="mx-auto size-40 rounded-full" />
        ) : byCapability.length ? (
          <>
            <Donut
              items={byCapability}
              centerValue={usage.totals.creditsUsed.toLocaleString()}
              centerLabel="credits used"
            />
            <Legend items={byCapability} />
          </>
        ) : (
          <EmptyState
            icon={PieChart}
            title="Nothing used yet"
            description="Generate or transcribe some audio and your usage shows up here."
          />
        )}
      </Panel>
    </div>
  );
}
