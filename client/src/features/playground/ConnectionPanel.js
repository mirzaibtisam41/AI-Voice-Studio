import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';

const CONNECTION_STATUS = {
  idle: { tone: 'neutral', label: 'Disconnected' },
  connecting: { tone: 'info', label: 'Connecting' },
  listening: { tone: 'success', label: 'Connected' },
  speaking: { tone: 'success', label: 'Connected' },
  ending: { tone: 'info', label: 'Ending' },
  ended: { tone: 'neutral', label: 'Disconnected' },
};

function ConnectionRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-[13px] first:pt-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right">{children}</dd>
    </div>
  );
}

export function ConnectionPanel({ phase, model, roundTripMs }) {
  const status = CONNECTION_STATUS[phase];
  const isLive = phase === 'listening' || phase === 'speaking';

  return (
    <Panel title="Connection">
      <dl className="flex flex-col divide-y">
        <ConnectionRow label="Protocol">WebRTC</ConnectionRow>
        <ConnectionRow label="Model">
          <span className="font-mono text-[12.5px]">{model ?? '—'}</span>
        </ConnectionRow>
        {isLive && roundTripMs !== null ? (
          <ConnectionRow label="Network round trip">
            <span className="font-mono text-[12.5px]">{roundTripMs} ms</span>
          </ConnectionRow>
        ) : null}
        <ConnectionRow label="Status">
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        </ConnectionRow>
      </dl>
    </Panel>
  );
}
