'use client';

import { useState } from 'react';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { Chip } from '@/components/ui/ChoiceChips';
import { cn } from '@/lib/utils';

const TRACK_KEYS = ['A', 'B'];

export function BeforeAfterPlayers({ before, after, showToggle = false }) {
  const [focused, setFocused] = useState('B');
  const tracks = { A: before, B: after };

  return (
    <div className="flex flex-col gap-3">
      {showToggle ? (
        <div
          role="group"
          aria-label="Compare tracks"
          className="flex flex-wrap gap-2"
        >
          {TRACK_KEYS.map((key) => (
            <Chip
              key={key}
              selected={focused === key}
              onClick={() => setFocused(key)}
            >
              <span className="font-mono">{key}</span>
              {tracks[key].label}
            </Chip>
          ))}
        </div>
      ) : null}
      {TRACK_KEYS.map((key) => {
        const track = tracks[key];
        const isFocused = showToggle && focused === key;

        return (
          <div key={key} className="flex flex-col gap-1.5">
            <span
              className={cn(
                'text-[12px] font-medium',
                isFocused ? 'text-brand' : 'text-muted-foreground',
              )}
            >
              {track.label}
            </span>
            <AudioPlayer
              id={track.id}
              label={track.label}
              duration={track.duration}
              className={cn(isFocused && 'border-brand/60')}
            />
          </div>
        );
      })}
    </div>
  );
}
