import { CheckCircle, Clock, Pencil, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/Panel';
import { StatCard } from '@/components/ui/StatCard';
import { formatDuration } from '@/lib/format';
import { AGENT_MODEL } from '@/mocks/agents';
import { findVoice } from '@/mocks/voices';

function SetupRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-[13px] first:pt-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right">{children}</dd>
    </div>
  );
}

export function AgentStats({ agent, onEdit }) {
  const voice = findVoice(agent.voice);
  const hasSessions = agent.sessions > 0;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
        <StatCard
          label="Total sessions"
          value={agent.sessions.toLocaleString('en-US')}
          icon={Phone}
          note="All time"
        />
        <StatCard
          label="Avg. duration"
          value={hasSessions ? formatDuration(agent.avgDuration) : '—'}
          icon={Clock}
          note="Minutes per session"
        />
        <StatCard
          label="Resolved without handoff"
          value={
            hasSessions && agent.resolvedRate !== null
              ? `${agent.resolvedRate}%`
              : '—'
          }
          icon={CheckCircle}
          trend={hasSessions ? agent.resolvedTrend : undefined}
          note="No sessions yet"
        />
      </div>
      <Panel title="Agent setup">
        <dl className="flex flex-col divide-y">
          <SetupRow label="Voice">
            {voice.name} — {voice.accent}
          </SetupRow>
          <SetupRow label="Model">
            <span className="font-mono text-[12.5px]">{AGENT_MODEL}</span>
          </SetupRow>
          <SetupRow label="Response style">{agent.responseStyle}</SetupRow>
          <SetupRow label="Tools">
            {agent.tools.length} {agent.tools.length === 1 ? 'tool' : 'tools'}{' '}
            enabled
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
