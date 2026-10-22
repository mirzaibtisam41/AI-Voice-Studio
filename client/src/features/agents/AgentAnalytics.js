import { BarChart } from '@/components/charts/Charts';
import { Panel } from '@/components/ui/Panel';
import { Tag } from '@/components/ui/StatusBadge';
import { WEEKDAYS } from '@/mocks/agents';

export function AgentAnalytics({ agent }) {
  const weekTotal = agent.weeklySessions.reduce((sum, value) => sum + value, 0);

  return (
    <Panel
      title={`${agent.name} — analytics`}
      description={`${weekTotal.toLocaleString('en-US')} sessions in the last 7 days`}
    >
      <BarChart
        labels={WEEKDAYS}
        values={agent.weeklySessions}
        color="teal"
        label={`Sessions per day for ${agent.name}`}
      />
      <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:gap-3">
        <span className="shrink-0 text-[12.5px] text-muted-foreground">
          Top intents
        </span>
        {agent.intents.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {agent.intents.map((intent) => (
              <li key={intent}>
                <Tag>{intent}</Tag>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-[12.5px] text-ink-3">
            Not enough sessions yet.
          </span>
        )}
      </div>
    </Panel>
  );
}
