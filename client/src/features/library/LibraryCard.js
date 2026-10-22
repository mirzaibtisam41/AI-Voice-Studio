'use client';

import {
  Download,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Trash2,
} from 'lucide-react';
import { useMockPlayback } from '@/components/audio/playbackStore';
import { Waveform } from '@/components/audio/Waveform';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { FavoriteButton } from '@/features/library/FavoriteButton';
import { LibraryTypeIcon } from '@/features/library/LibraryTypeIcon';
import { getLibraryTypeMeta } from '@/features/library/libraryTypes';
import { formatBytes, formatDuration } from '@/lib/format';

export function LibraryCard({
  item,
  onToggleFavorite,
  onDownload,
  onRename,
  onDelete,
}) {
  const { isPlaying, elapsed, progress, toggle } = useMockPlayback(
    item.id,
    item.durationSeconds,
  );
  const PlayIcon = isPlaying ? Pause : Play;
  const typeLabel = getLibraryTypeMeta(item.type).label;

  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-2xl border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <LibraryTypeIcon type={item.type} />
        <div className="-mt-1 -mr-1 flex items-center">
          <FavoriteButton
            favorite={item.favorite}
            title={item.title}
            onToggle={onToggleFavorite}
          />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`More actions for ${item.title}`}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onSelect={onDownload}>
                <Download />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onRename}>
                <Pencil />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-[13.5px] font-semibold" title={item.title}>
          {item.title}
        </h3>
        <p className="truncate font-mono text-[11.5px] text-ink-3">
          {typeLabel} · {formatDuration(item.durationSeconds)} ·{' '}
          {formatBytes(item.sizeBytes)}
        </p>
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-label={`${isPlaying ? 'Pause' : 'Play'} ${item.title}`}
        aria-pressed={isPlaying}
        className="group mt-auto flex items-center gap-2.5 rounded-xl bg-field/60 px-2.5 py-2 text-left transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground group-hover:bg-brand-strong">
          <PlayIcon className="size-3 fill-current" aria-hidden="true" />
        </span>
        <Waveform
          seed={item.id}
          bars={32}
          progress={progress}
          className="h-7 flex-1"
        />
        <span className="shrink-0 font-mono text-[11px] text-ink-3">
          {formatDuration(elapsed > 0 ? elapsed : item.durationSeconds)}
        </span>
      </button>
    </article>
  );
}
