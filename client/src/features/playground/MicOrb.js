import { Mic, MicOff } from 'lucide-react';
import { Waveform } from '@/components/audio/Waveform';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/utils';

const STATUS = {
  idle: { tone: 'neutral', label: 'Idle' },
  connecting: { tone: 'info', label: 'Connecting' },
  listening: { tone: 'success', label: 'Listening' },
  speaking: { tone: 'brand', label: 'Agent speaking' },
  ending: { tone: 'info', label: 'Ending' },
  ended: { tone: 'neutral', label: 'Ended' },
};

export function MicOrb({ phase, muted, orbRef, meterRef }) {
  const status = STATUS[phase];
  const isLive = phase === 'listening' || phase === 'speaking';

  return (
    <div className="flex flex-col items-center gap-4">
      <StatusBadge tone={muted && isLive ? 'warning' : status.tone}>
        {muted && isLive ? 'Muted' : status.label}
      </StatusBadge>
      <div className="relative flex size-44 items-center justify-center">
        {phase === 'listening' && !muted ? (
          <>
            <span
              aria-hidden="true"
              className="absolute size-[120px] animate-pulse-ring rounded-full bg-brand/35"
            />
            <span
              aria-hidden="true"
              className="absolute size-[120px] animate-pulse-ring rounded-full bg-brand/25"
              style={{ animationDelay: '0.9s' }}
            />
          </>
        ) : null}
        <div
          ref={orbRef}
          className={cn(
            'relative flex size-[120px] items-center justify-center rounded-full bg-brand text-brand-foreground shadow-[0_18px_60px_-14px_var(--brand-glow)] transition-[transform,opacity] duration-100',
            (phase === 'idle' || phase === 'ended' || phase === 'ending') &&
              'opacity-90',
          )}
        >
          {phase === 'connecting' ? (
            <Spinner className="size-9" />
          ) : phase === 'speaking' ? (
            <Waveform
              seed="agent-speaking"
              bars={9}
              animated
              className="h-10 w-16"
              barClassName="bg-brand-foreground"
            />
          ) : muted && isLive ? (
            <MicOff className="size-10" aria-hidden="true" />
          ) : (
            <Mic className="size-10" aria-hidden="true" />
          )}
        </div>
      </div>
      <div
        className={cn(
          'h-1.5 w-40 overflow-hidden rounded-full bg-field transition-opacity',
          isLive ? 'opacity-100' : 'opacity-0',
        )}
        role="presentation"
      >
        <div
          ref={meterRef}
          className="h-full w-0 rounded-full bg-brand transition-[width] duration-75"
        />
      </div>
    </div>
  );
}
