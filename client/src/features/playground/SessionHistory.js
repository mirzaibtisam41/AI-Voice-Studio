'use client';

import { useState } from 'react';
import { History, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormAlert } from '@/components/ui/FormAlert';
import { Panel } from '@/components/ui/Panel';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getErrorMessage } from '@/lib/apiError';
import { formatDateTime, formatDuration } from '@/lib/format';
import { TranscriptLines } from '@/features/playground/LiveTranscript';
import {
  useGetRealtimeSessionQuery,
  useListRealtimeSessionsQuery,
} from '@/features/playground/realtimeApi';

const HISTORY_LIMIT = 10;

function describeSession(session) {
  if (session.status === 'failed') return 'Not connected · refunded';
  if (session.status === 'processing') return 'In progress';

  const turns = `${session.turnCount} ${session.turnCount === 1 ? 'turn' : 'turns'}`;

  return `${formatDuration(session.durationSeconds ?? 0)} · ${turns}`;
}

function toLines(transcript) {
  return transcript.map((line, index) => ({
    id: `${index}`,
    speaker: line.role === 'assistant' ? 'agent' : 'user',
    text: line.text,
    at: line.at ?? 0,
    pending: false,
  }));
}

function TranscriptDialog({ sessionId, onClose }) {
  const { data, isLoading, error } = useGetRealtimeSessionQuery(sessionId, {
    skip: !sessionId,
  });

  return (
    <Dialog
      open={Boolean(sessionId)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogTitle>Conversation transcript</DialogTitle>
        <DialogDescription>
          {data
            ? `${formatDateTime(data.createdAt)} · ${describeSession(data)} · ${data.creditsCharged} credits`
            : 'Loading the conversation…'}
        </DialogDescription>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="ml-auto h-10 w-2/3" />
          </div>
        ) : error ? (
          <FormAlert>{getErrorMessage(error)}</FormAlert>
        ) : data?.transcript?.length ? (
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            <TranscriptLines lines={toLines(data.transcript)} />
          </div>
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="No transcript"
            description="Nothing was said in this conversation."
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export function SessionHistory({ agentId }) {
  const [openId, setOpenId] = useState(null);
  const { data, isLoading, error } = useListRealtimeSessionsQuery({
    limit: HISTORY_LIMIT,
    ...(agentId ? { agentId } : {}),
  });
  const sessions = data?.sessions ?? [];

  return (
    <Panel title="Conversation history">
      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error ? (
        <FormAlert>{getErrorMessage(error)}</FormAlert>
      ) : sessions.length === 0 ? (
        <p className="text-[12.5px] text-ink-3">No conversations yet.</p>
      ) : (
        <ul className="flex flex-col divide-y">
          {sessions.map((session) => (
            <li key={session.id} className="py-1 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => setOpenId(session.id)}
                className="flex w-full items-center gap-3 rounded-lg p-1.5 text-left outline-none hover:bg-accent/60 focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-field text-ink-3">
                  <History className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium">
                    {formatDateTime(session.createdAt)}
                    {session.kind === 'agent' ? (
                      <StatusBadge tone="brand" className="ml-2">
                        Agent
                      </StatusBadge>
                    ) : null}
                  </span>
                  <span className="block font-mono text-[12px] text-ink-3">
                    {describeSession(session)}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[12px] text-muted-foreground">
                  {session.status === 'processing'
                    ? `${session.creditsHeld} held`
                    : session.status === 'failed'
                      ? 'Refunded'
                      : `−${session.creditsCharged} cr`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <TranscriptDialog sessionId={openId} onClose={() => setOpenId(null)} />
    </Panel>
  );
}
