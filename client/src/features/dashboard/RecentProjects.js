'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { FavoriteButton } from '@/features/library/FavoriteButton';
import { LibraryTypeIcon } from '@/features/library/LibraryTypeIcon';
import { formatDateTime, formatDuration } from '@/lib/format';
import { getRecentLibraryItems } from '@/mocks/library';

export function RecentProjects() {
  const [items, setItems] = useState(() => getRecentLibraryItems(5));

  const toggleFavorite = (id) =>
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, favorite: !item.favorite } : item,
      ),
    );

  return (
    <Panel
      title="Recent projects"
      action={
        <Link
          href="/app/library"
          className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-medium text-brand hover:underline"
        >
          View all
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      }
    >
      <ul className="-my-1 flex flex-col">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-2">
            <LibraryTypeIcon type={item.type} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{item.title}</p>
              <p className="truncate font-mono text-[11.5px] text-ink-3">
                {formatDateTime(item.createdAt)} ·{' '}
                {formatDuration(item.durationSeconds)}
              </p>
            </div>
            <FavoriteButton
              favorite={item.favorite}
              title={item.title}
              onToggle={() => toggleFavorite(item.id)}
            />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
