'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Copy, Pencil, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/input';
import { Panel } from '@/components/ui/Panel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RenameSpeakerDialog } from '@/features/speech-to-text/RenameSpeakerDialog';
import { TRANSCRIPT_FORMATS } from '@/features/speech-to-text/transcriptMock';
import { cn } from '@/lib/utils';

const SPEAKER_TONES = {
  A: 'bg-brand-tint text-brand',
  B: 'bg-teal/15 text-teal',
};

function formatTimestamp(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const rest = String(seconds % 60).padStart(2, '0');

  return `${minutes}:${rest}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function HighlightedText({ text, term }) {
  if (!term) return text;

  const parts = text.split(new RegExp(`(${escapeRegExp(term)})`, 'gi'));

  return parts.map((part, index) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={index} className="rounded-sm bg-brand-tint text-brand">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function TranscriptPanel({
  segments,
  onSegmentChange,
  speakers,
  onSpeakerRename,
  showSpeakers,
  showTimestamps,
}) {
  const [query, setQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [renamingSpeaker, setRenamingSpeaker] = useState(null);
  const term = query.trim();
  const visibleSegments = term
    ? segments.filter((segment) =>
        segment.text.toLowerCase().includes(term.toLowerCase()),
      )
    : segments;

  async function copyTranscript() {
    const text = segments
      .map((segment) =>
        showSpeakers
          ? `${speakers[segment.speaker]}: ${segment.text}`
          : segment.text,
      )
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(text);
      toast.success('Transcript copied');
    } catch {
      toast.error('Could not copy to the clipboard');
    }
  }

  return (
    <Panel title="Transcript">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search in transcript..."
            aria-label="Search in transcript"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={copyTranscript}>
            <Copy />
            Copy
          </Button>
          <Select
            value=""
            onValueChange={(format) =>
              toast.success(`Downloading transcript.${format.toLowerCase()}`)
            }
          >
            <SelectTrigger aria-label="Download transcript" className="w-32">
              <SelectValue placeholder="Download" />
            </SelectTrigger>
            <SelectContent align="end">
              {TRANSCRIPT_FORMATS.map((format) => (
                <SelectItem key={format} value={format}>
                  {format}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={isEditing ? 'default' : 'outline'}
            aria-pressed={isEditing}
            onClick={() => setIsEditing((current) => !current)}
          >
            {isEditing ? <Check /> : <Pencil />}
            {isEditing ? 'Done' : 'Edit'}
          </Button>
        </div>
      </div>

      {visibleSegments.length ? (
        <ol className="flex flex-col divide-y">
          {visibleSegments.map((segment) => (
            <li
              key={segment.id}
              className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:gap-4"
            >
              {showSpeakers || showTimestamps ? (
                <div className="flex shrink-0 items-center gap-2 sm:w-36 sm:flex-col sm:items-start sm:gap-1.5">
                  {showSpeakers ? (
                    <button
                      type="button"
                      onClick={() => setRenamingSpeaker(segment.speaker)}
                      aria-label={`Rename ${speakers[segment.speaker]}`}
                      title="Rename speaker"
                      className={cn(
                        'inline-flex h-6 max-w-full items-center truncate rounded-full px-2.5 text-[11.5px] font-semibold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                        SPEAKER_TONES[segment.speaker],
                      )}
                    >
                      {speakers[segment.speaker]}
                    </button>
                  ) : null}
                  {showTimestamps ? (
                    <span className="font-mono text-[11.5px] text-ink-3">
                      {formatTimestamp(segment.start)}
                    </span>
                  ) : null}
                </div>
              ) : null}
              {isEditing ? (
                <Textarea
                  value={segment.text}
                  onChange={(event) =>
                    onSegmentChange(segment.id, event.target.value)
                  }
                  aria-label={`Segment at ${formatTimestamp(segment.start)}`}
                  className="min-h-16 flex-1 text-[13.5px] leading-relaxed"
                />
              ) : (
                <p className="flex-1 text-[13.5px] leading-relaxed">
                  <HighlightedText text={segment.text} term={term} />
                </p>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState
          icon={Search}
          title="No matches"
          description={`Nothing in this transcript matches "${term}".`}
        />
      )}

      <RenameSpeakerDialog
        speaker={renamingSpeaker}
        currentName={renamingSpeaker ? speakers[renamingSpeaker] : ''}
        onRename={(name) => {
          onSpeakerRename(renamingSpeaker, name);
          setRenamingSpeaker(null);
          toast.success('Speaker renamed');
        }}
        onClose={() => setRenamingSpeaker(null)}
      />
    </Panel>
  );
}
