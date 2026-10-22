'use client';

import { FileAudio, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/lib/format';
import { cn } from '@/lib/utils';

const CLEAR_THRESHOLD = 85;

export function SampleList({ samples, onRemove }) {
  if (samples.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2">
      {samples.map((sample) => {
        const isClear = sample.quality >= CLEAR_THRESHOLD;

        return (
          <li
            key={sample.id}
            className="flex items-center gap-3 rounded-xl border bg-field px-3 py-2.5"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
              <FileAudio className="size-4" aria-hidden="true" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-[13px] font-medium">
                  {sample.name}
                </span>
                <span className="shrink-0 font-mono text-[11.5px] text-ink-3">
                  {formatBytes(sample.size)}
                </span>
              </div>
              <div
                role="meter"
                aria-label={`${sample.name} quality`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={sample.quality}
                className="h-1.5 overflow-hidden rounded-full bg-background/60"
              >
                <div
                  className={cn(
                    'h-full rounded-full',
                    isClear ? 'bg-success' : 'bg-warning',
                  )}
                  style={{ width: `${sample.quality}%` }}
                />
              </div>
              <span
                className={cn(
                  'text-[11.5px]',
                  isClear ? 'text-success' : 'text-warning',
                )}
              >
                {isClear ? 'Clear speech' : 'Some background noise'} ·{' '}
                <span className="font-mono">{sample.quality}%</span>
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${sample.name}`}
              onClick={() => onRemove(sample.id)}
            >
              <X />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
