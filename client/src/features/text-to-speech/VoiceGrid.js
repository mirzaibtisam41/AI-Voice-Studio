'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { PlayButton } from '@/components/audio/AudioPlayer';
import { useAudioPlayback } from '@/components/audio/playbackStore';
import { VOICE_COLORS, VoiceInitial } from '@/components/audio/VoicePicker';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/Spinner';
import { useLazyGetVoicePreviewQuery } from '@/features/voices/voicesApi';
import { getErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

const COLOR_NAMES = Object.keys(VOICE_COLORS);

function describeVoice(voice) {
  return [voice.accent, voice.gender, voice.tags?.join(', ')]
    .filter(Boolean)
    .join(' · ');
}

function VoicePreviewButton({ voice }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const playWhenReady = useRef(false);
  const [loadPreview, { isFetching }] = useLazyGetVoicePreviewQuery();
  const playback = useAudioPlayback(`voice-preview-${voice.id}`, {
    src: previewUrl,
  });
  const { toggle, error: playbackError } = playback;

  useEffect(() => {
    if (playbackError) toast.error(`${voice.name} preview: ${playbackError}`);
  }, [playbackError, voice.name]);

  useEffect(() => {
    if (!playWhenReady.current || !previewUrl) return;

    playWhenReady.current = false;
    toggle();
  }, [previewUrl, toggle]);

  async function handleClick() {
    if (previewUrl) {
      toggle();
      return;
    }

    try {
      const url = await loadPreview(voice.id, true).unwrap();

      playWhenReady.current = true;
      setPreviewUrl(url);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  if (isFetching) {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center text-muted-foreground">
        <Spinner />
        <span className="sr-only">Loading {voice.name} preview</span>
      </span>
    );
  }

  return (
    <PlayButton
      isPlaying={playback.isPlaying}
      onClick={handleClick}
      label={`${voice.name} preview`}
      className="bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
    />
  );
}

function VoiceCard({ voice, color, selected, onSelect }) {
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
        onClick={() => onSelect(voice.code)}
        aria-pressed={selected}
        className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none focus-visible:underline"
      >
        <VoiceInitial voice={{ name: voice.name, color }} />
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold">
            {voice.name}
          </span>
          <span className="block truncate text-[11.5px] text-ink-3 capitalize">
            {describeVoice(voice)}
          </span>
        </span>
      </button>
      <VoicePreviewButton voice={voice} />
    </div>
  );
}

export function VoiceGrid({ voices, value, onChange }) {
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();
  const filtered = voices.filter((voice) =>
    [voice.name, voice.accent, voice.gender, ...(voice.tags ?? [])]
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
              color={
                COLOR_NAMES[voices.indexOf(voice) % COLOR_NAMES.length] ??
                'brand'
              }
              selected={voice.code === value}
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
