import { Clock, Coins, MessageSquare, Pencil, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/Panel';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/StatCard';
import { formatDuration } from '@/lib/format';
import {
  AGENT_RESPONSE_STYLES,
  findVoiceName,
} from '@/features/agents/agentOptions';
import { useGetAgentAnalyticsQuery } from '@/features/agents/agentsApi';

function SetupRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-[13px] first:pt-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right">{children}</dd>
    </div>
  );
}

function AnalyticsCards({ agentId, days }) {
  const { data, isLoading } = useGetAgentAnalyticsQuery({ id: agentId, days });
  const period = `Last ${days} days`;

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-[118px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
      <StatCard
        label="Voice sessions"
        value={data.sessions.toLocaleString('en-US')}
        icon={Phone}
        note={`${data.totalMinutes.toLocaleString('en-US')} min total · ${period}`}
      />
      <StatCard
        label="Avg. duration"
        value={
          data.sessions > 0 ? formatDuration(data.avgDurationSeconds) : '—'
        }
        icon={Clock}
        note="Per voice session"
      />
      <StatCard
        label="Test chats"
        value={data.chats.toLocaleString('en-US')}
        icon={MessageSquare}
        note={period}
      />
      <StatCard
        label="Credits used"
        value={data.creditsUsed.toLocaleString('en-US')}
        icon={Coins}
        note={period}
      />
    </div>
  );
}

export function AgentStats({ agent, options, days, onEdit }) {
  const model = options?.agentModels.find((item) => item.isDefault);
  const style =
    AGENT_RESPONSE_STYLES.find((item) => item.value === agent.responseStyle)
      ?.label ?? agent.responseStyle;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <AnalyticsCards agentId={agent.id} days={days} />
      <Panel title="Agent setup">
        <dl className="flex flex-col divide-y">
          <SetupRow label="Voice">
            {findVoiceName(options?.voices, agent.voiceCode)}
          </SetupRow>
          {model ? (
            <SetupRow label="Voice model">
              <span className="font-mono text-[12.5px]">
                {model.providerModelId}
              </span>
            </SetupRow>
          ) : null}
          <SetupRow label="Response style">{style}</SetupRow>
          <SetupRow label="Tools">
            {agent.tools.length} {agent.tools.length === 1 ? 'tool' : 'tools'}{' '}
            selected
          </SetupRow>
        </dl>
        <Button variant="outline" onClick={() => onEdit(agent)}>
          <Pencil aria-hidden="true" />
          Edit agent
        </Button>
      </Panel>
    </div>
  );
}
