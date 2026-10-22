'use client';

import Link from 'next/link';
import { ArrowRight, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormAlert } from '@/components/ui/FormAlert';
import { Panel } from '@/components/ui/Panel';
import { Skeleton } from '@/components/ui/skeleton';
import { FavoriteButton } from '@/features/library/FavoriteButton';
import { LibraryTypeIcon } from '@/features/library/LibraryTypeIcon';
import {
  useListLibraryAudioFilesQuery,
  useUpdateAudioFileMutation,
} from '@/features/library/libraryApi';
import { formatAudioDuration } from '@/features/library/libraryTypes';
import { getErrorMessage } from '@/lib/apiError';
import { formatDateTime } from '@/lib/format';

const RECENT_QUERY = { page: 1, limit: 5, sort: 'newest' };

export function RecentProjects() {
  const { data, isLoading, error } =
    useListLibraryAudioFilesQuery(RECENT_QUERY);
  const [updateAudioFile] = useUpdateAudioFileMutation();
  const items = data?.audioFiles ?? [];

  const toggleFavorite = async (item) => {
    try {
      await updateAudioFile({ id: item.id, favorite: !item.favorite }).unwrap();
    } catch (favoriteError) {
      toast.error(getErrorMessage(favoriteError));
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
      );
    }

    if (error) return <FormAlert>{getErrorMessage(error)}</FormAlert>;

    if (items.length === 0) {
      return (
        <EmptyState
          icon={FolderOpen}
          title="No audio yet"
          description="Generate speech or upload a file and it shows up here."
        />
      );
    }

    return (
      <ul className="-my-1 flex flex-col">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-2">
            <LibraryTypeIcon type={item.kind} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{item.title}</p>
              <p className="truncate font-mono text-[11.5px] text-ink-3">
                {formatDateTime(item.createdAt)} ·{' '}
                {formatAudioDuration(item.durationSeconds)}
              </p>
            </div>
            <FavoriteButton
              favorite={item.favorite}
              title={item.title}
              onToggle={() => toggleFavorite(item)}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Panel
      title="Recent audio"
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
      {renderContent()}
    </Panel>
  );
}
