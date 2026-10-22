'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { PlayButton } from '@/components/audio/AudioPlayer';
import { useMockPlayback } from '@/components/audio/playbackStore';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const VOICE_COLORS = {
  brand: 'bg-brand/15 text-brand',
  teal: 'bg-teal/15 text-teal',
  blue: 'bg-blue/15 text-blue',
  amber: 'bg-amber/15 text-amber',
  success: 'bg-success/15 text-success',
  danger: 'bg-danger/15 text-danger',
};

export function VoiceInitial({ voice, className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-lg text-[13px] font-semibold',
        VOICE_COLORS[voice.color] ?? VOICE_COLORS.brand,
        className,
      )}
    >
      {voice.name[0]}
    </span>
  );
}

function VoiceCard({ voice, selected, onSelect }) {
  const { isPlaying, toggle } = useMockPlayback(`voice-${voice.id}`, 4);

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border p-3 transition-colors',
        selected
          ? 'border-brand/70 bg-brand-tint'
          : 'bg-background/40 hover:border-input',
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(voice.id)}
        aria-pressed={selected}
        className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none focus-visible:underline"
      >
        <VoiceInitial voice={voice} />
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold">
            {voice.name}
          </span>
          <span className="block truncate text-[11.5px] text-ink-3">
            {voice.accent} · {voice.gender} · {voice.style}
          </span>
        </span>
      </button>
      <PlayButton
        isPlaying={isPlaying}
        onClick={toggle}
        label={`${voice.name} preview`}
        className="bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
      />
    </div>
  );
}

export function VoicePicker({ voices, value, onChange }) {
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();
  const filtered = voices.filter((voice) =>
    [voice.name, voice.accent, voice.gender, voice.style]
      .join(' ')
      .toLowerCase()
      .includes(term),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search voices..."
          aria-label="Search voices"
          className="pl-9"
        />
      </div>
      {filtered.length ? (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {filtered.map((voice) => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              selected={voice.id === value}
              onSelect={onChange}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No voices match"
          description="Try an accent, gender or style."
        />
      )}
    </div>
  );
}
