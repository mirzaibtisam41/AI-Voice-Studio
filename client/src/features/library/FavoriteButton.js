'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FavoriteButton({ favorite, title, onToggle, className }) {
  return (
    <button
      type="button"
      aria-pressed={favorite}
      aria-label={`Favorite ${title}`}
      title={favorite ? 'Remove from favorites' : 'Add to favorites'}
      onClick={onToggle}
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50',
        favorite ? 'text-amber' : 'text-ink-3 hover:text-foreground',
        className,
      )}
    >
      <Star
        className={cn('size-4', favorite && 'fill-current')}
        aria-hidden="true"
      />
    </button>
  );
}
