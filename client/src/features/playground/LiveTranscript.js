'use client';

import { useEffect, useRef } from 'react';
import { Copy, EyeOff, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Panel } from '@/components/ui/Panel';
import { formatDuration } from '@/lib/format';
import { cn } from '@/lib/utils';

function TranscriptBubble({ line }) {
  const isAgent = line.speaker === 'agent';
  const isTyping = isAgent && line.shown < line.text.length;

  return (
    <li
      className={cn(
        'flex max-w-[85%] flex-col gap-1',
        isAgent ? 'self-start' : 'items-end self-end',
      )}
    >
      <span className="flex items-center gap-2 text-[11px] text-ink-3">
        <span className="font-medium">{isAgent ? 'Agent' : 'You'}</span>
        <span className="font-mono">{formatDuration(line.at)}</span>
      </span>
      <p
        className={cn(
          'rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed',
          isAgent
            ? 'rounded-tl-md border bg-field'
            : 'rounded-tr-md bg-brand-tint text-foreground',
        )}
      >
        {line.text.slice(0, line.shown)}
        {isTyping ? (
          <span
            aria-hidden="true"
            className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-brand align-middle"
          />
        ) : null}
      </p>
    </li>
  );
}

export function LiveTranscript({ lines, captionsEnabled, isLive }) {
  const scrollRef = useRef(null);
  const visibleLength = lines.reduce((total, line) => total + line.shown, 0);

  useEffect(() => {
    const container = scrollRef.current;

    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [visibleLength, lines.length]);

  const copyTranscript = async () => {
    const text = lines
      .map(
        (line) =>
          `[${formatDuration(line.at)}] ${line.speaker === 'agent' ? 'Agent' : 'You'}: ${line.text}`,
      )
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      toast.success('Transcript copied');
    } catch {
      toast.error('Could not copy the transcript');
    }
  };

  const hasContent = captionsEnabled && lines.length > 0;

  return (
    <Panel
      title="Live transcript"
      description={isLive ? 'Captions update as you talk.' : undefined}
      action={
        hasContent ? (
          <Button variant="outline" size="sm" onClick={copyTranscript}>
            <Copy aria-hidden="true" />
            Copy transcript
          </Button>
        ) : null
      }
    >
      {!captionsEnabled ? (
        <EmptyState
          icon={EyeOff}
          title="Live captions are off"
          description="Turn on “Show live captions” in session settings to see the conversation here."
        />
      ) : lines.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No transcript yet"
          description="Start a conversation to see live captions appear here."
        />
      ) : (
        <div
          ref={scrollRef}
          className="max-h-[360px] overflow-y-auto pr-1"
          aria-live="polite"
        >
          <ol className="flex flex-col gap-3">
            {lines.map((line) => (
              <TranscriptBubble key={line.id} line={line} />
            ))}
          </ol>
        </div>
      )}
    </Panel>
  );
}
