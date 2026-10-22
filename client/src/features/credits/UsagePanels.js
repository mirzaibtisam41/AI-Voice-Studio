'use client';

import { useState } from 'react';
import { Donut, Legend, LineChart } from '@/components/charts/Charts';
import { Panel } from '@/components/ui/Panel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCompact } from '@/lib/format';
import { USAGE_BY_FEATURE, USAGE_RANGES, USED_THIS_MONTH } from '@/mocks/usage';

export function UsagePanels() {
  const [range, setRange] = useState(USAGE_RANGES[0].value);
  const selected =
    USAGE_RANGES.find((option) => option.value === range) ?? USAGE_RANGES[0];

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Panel
        title="Usage over time"
        description="Credits spent across all features"
        action={
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger
              aria-label="Usage range"
              className="h-8 w-36 shrink-0 text-[12.5px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {USAGE_RANGES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      >
        <LineChart
          labels={selected.data.labels}
          series={[
            { name: 'Credits', color: 'teal', values: selected.data.values },
          ]}
          area
          height={220}
          label={`Credits used, ${selected.label.toLowerCase()}`}
        />
      </Panel>

      <Panel title="Usage by feature" description="This month">
        <Donut
          items={USAGE_BY_FEATURE}
          centerValue={formatCompact(USED_THIS_MONTH)}
          centerLabel="credits used"
        />
        <Legend items={USAGE_BY_FEATURE} />
      </Panel>
    </div>
  );
}
