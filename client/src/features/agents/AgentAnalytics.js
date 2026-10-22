'use client';

import { BarChart } from '@/components/charts/Charts';
import { ChoiceChips } from '@/components/ui/ChoiceChips';
import { FormAlert } from '@/components/ui/FormAlert';
import { Panel } from '@/components/ui/Panel';
import { Skeleton } from '@/components/ui/skeleton';
import { getErrorMessage } from '@/lib/apiError';
import { useGetAgentAnalyticsQuery } from '@/features/agents/agentsApi';

const DAY_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
];

function formatDay(date, days) {
  const value = new Date(`${date}T00:00:00Z`);

  if (days <= 7) {
    return value.toLocaleDateString('en-US', {
      weekday: 'short',
      timeZone: 'UTC',
    });
  }

  return `${value.getUTCMonth() + 1}/${value.getUTCDate()}`;
}

export function AgentAnalytics({ agent, days, onDaysChange }) {
  const { data, isLoading, error } = useGetAgentAnalyticsQuery({
    id: agent.id,
    days,
  });
  const total = data ? data.sessions + data.chats : 0;

  return (
    <Panel
      title={`${agent.name} — analytics`}
      description={
        data
          ? `${data.sessions.toLocaleString('en-US')} voice sessions and ${data.chats.toLocaleString('en-US')} test chats in the last ${days} days`
          : `Activity in the last ${days} days`
      }
      action={
        <ChoiceChips
          label="Period"
          options={DAY_OPTIONS}
          value={days}
          onChange={onDaysChange}
          className="shrink-0 flex-nowrap"
        />
      }
    >
      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : error ? (
        <FormAlert>{getErrorMessage(error)}</FormAlert>
      ) : data ? (
        <>
          <BarChart
            labels={data.daily.map((row) => formatDay(row.date, days))}
            values={data.daily.map((row) => row.sessions + row.chats)}
            color="teal"
            label={`Voice sessions and test chats per day for ${agent.name}`}
          />
          <p className="text-[12px] text-ink-3">
            {total === 0
              ? 'No activity in this period yet.'
              : 'Bars show voice sessions plus test chats per day (UTC).'}
          </p>
        </>
      ) : null}
    </Panel>
  );
}
