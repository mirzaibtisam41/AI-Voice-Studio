'use client';

import { useSelector } from 'react-redux';
import { PieChart } from 'lucide-react';
import { Donut, Legend, LineChart } from '@/components/charts/Charts';
import { EmptyState } from '@/components/ui/EmptyState';
import { Panel } from '@/components/ui/Panel';
import { selectTransactions } from '@/features/credits/walletSlice';
import {
  dailyUsage,
  totalUsed,
  usageByFeature,
} from '@/features/credits/walletUsage';

export function UsagePanels() {
  const transactions = useSelector(selectTransactions);
  const daily = dailyUsage(transactions);
  const byFeature = usageByFeature(transactions);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Panel title="Usage over time" description="Credits spent per day">
        <LineChart
          labels={daily.labels}
          series={[{ name: 'Credits', color: 'teal', values: daily.values }]}
          area
          height={220}
          label="Credits used per day, last 7 days"
        />
      </Panel>

      <Panel title="Usage by feature" description="Since you signed up">
        {byFeature.length ? (
          <>
            <Donut
              items={byFeature}
              centerValue={totalUsed(transactions).toLocaleString()}
              centerLabel="credits used"
            />
            <Legend items={byFeature} />
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
