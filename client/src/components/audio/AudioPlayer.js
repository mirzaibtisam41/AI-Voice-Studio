'use client';

import { Pause, Play } from 'lucide-react';
import { useMockPlayback } from '@/components/audio/playbackStore';
import { Waveform } from '@/components/audio/Waveform';
import { formatDuration } from '@/lib/format';
import { cn } from '@/lib/utils';

export function PlayButton({ isPlaying, onClick, label, className }) {
  const Icon = isPlaying ? Pause : Play;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${isPlaying ? 'Pause' : 'Play'} ${label}`}
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground transition-colors outline-none hover:bg-brand-strong focus-visible:ring-[3px] focus-visible:ring-ring/50',
        className,
      )}
    >
      <Icon className="size-3.5 fill-current" aria-hidden="true" />
    </button>
  );
}

export function AudioPlayer({ id, label, duration, bars = 56, className }) {
  const { isPlaying, elapsed, progress, toggle } = useMockPlayback(
    id,
    duration,
  );

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-field/60 px-3 py-2.5',
        className,
      )}
    >
      <PlayButton isPlaying={isPlaying} onClick={toggle} label={label} />
      <Waveform seed={id} bars={bars} progress={progress} className="flex-1" />
      <span className="shrink-0 font-mono text-[11.5px] text-ink-3">
        {formatDuration(elapsed)} / {formatDuration(duration)}
      </span>
    </div>
  );
}
