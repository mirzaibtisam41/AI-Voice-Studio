import { History } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { formatDuration } from '@/lib/format';

function formatTime(value) {
  return new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function SessionHistory({ sessions }) {
  return (
    <Panel title="Conversation history">
      {sessions.length === 0 ? (
        <p className="text-[12.5px] text-ink-3">No sessions yet this visit.</p>
      ) : (
        <ul className="flex flex-col divide-y">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-field text-ink-3">
                <History className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium">
                  {formatTime(session.endedAt)}
                </p>
                <p className="text-[12px] text-ink-3">
                  <span className="font-mono">
                    {formatDuration(session.duration)}
                  </span>
                  {' · '}
                  {session.turns} {session.turns === 1 ? 'turn' : 'turns'}
                </p>
              </div>
              <span className="shrink-0 font-mono text-[12px] text-muted-foreground">
                −{session.credits.toLocaleString()} cr
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
