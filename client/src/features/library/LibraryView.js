'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  SearchX,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormAlert } from '@/components/ui/FormAlert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LibraryCard } from '@/features/library/LibraryCard';
import { LibraryToolbar } from '@/features/library/LibraryToolbar';
import { RenameDialog } from '@/features/library/RenameDialog';
import { UploadAudioDialog } from '@/features/library/UploadAudioDialog';
import {
  useDeleteAudioFileMutation,
  useGetAudioFileDownloadMutation,
  useListLibraryAudioFilesQuery,
  useUpdateAudioFileMutation,
} from '@/features/library/libraryApi';
import { buildLibraryParams } from '@/features/library/libraryTypes';
import { useDebouncedValue } from '@/features/library/useDebouncedValue';
import { getErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 24;
const SEARCH_DELAY_MS = 300;

const DEFAULT_QUERY = {
  type: 'all',
  search: '',
  sort: 'newest',
  favoritesOnly: false,
};

function isDefaultQuery(query) {
  return (
    query.type === DEFAULT_QUERY.type &&
    !query.search.trim() &&
    !query.favoritesOnly
  );
}

function openDownload(url) {
  const link = document.createElement('a');

  link.href = url;
  link.rel = 'noopener';
  document.body.append(link);
  link.click();
  link.remove();
}

export function LibraryView() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [page, setPage] = useState(1);
  const [renaming, setRenaming] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const search = useDebouncedValue(query.search, SEARCH_DELAY_MS);
  const { data, isLoading, isFetching, error } = useListLibraryAudioFilesQuery(
    buildLibraryParams({ ...query, search, page, limit: PAGE_SIZE }),
  );
  const [updateAudioFile, { isLoading: isRenaming }] =
    useUpdateAudioFileMutation();
  const [deleteAudioFile] = useDeleteAudioFileMutation();
  const [getDownloadUrl] = useGetAudioFileDownloadMutation();
  const items = data?.audioFiles ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 0;

  const updateQuery = (key) => (value) => {
    setQuery((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const resetQuery = () => {
    setQuery(DEFAULT_QUERY);
    setPage(1);
  };

  const toggleFavorite = async (item) => {
    try {
      await updateAudioFile({ id: item.id, favorite: !item.favorite }).unwrap();
    } catch (favoriteError) {
      toast.error(getErrorMessage(favoriteError));
    }
  };

  const handleRename = async (title) => {
    try {
      await updateAudioFile({ id: renaming.id, title }).unwrap();
      setRenaming(null);
      toast.success('Item renamed');
    } catch (renameError) {
      toast.error(getErrorMessage(renameError));
    }
  };

  const handleDelete = async () => {
    const target = deleting;

    setDeleting(null);

    try {
      await deleteAudioFile(target.id).unwrap();
      toast.success(`Deleted “${target.title}”`);
      if (items.length === 1 && page > 1) setPage(page - 1);
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError));
    }
  };

  const handleDownload = async (item) => {
    try {
      openDownload(await getDownloadUrl(item.id).unwrap());
    } catch (downloadError) {
      toast.error(getErrorMessage(downloadError));
    }
  };

  const renderItems = () => {
    if (isLoading) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-43 rounded-2xl" />
          ))}
        </div>
      );
    }

    if (error) return null;

    if (items.length > 0) {
      return (
        <div
          className={cn(
            'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
            isFetching && 'opacity-70',
          )}
          aria-busy={isFetching}
        >
          {items.map((item) => (
            <LibraryCard
              key={item.id}
              item={item}
              onToggleFavorite={() => toggleFavorite(item)}
              onDownload={() => handleDownload(item)}
              onRename={() => setRenaming(item)}
              onDelete={() => setDeleting(item)}
            />
          ))}
        </div>
      );
    }

    if (isDefaultQuery(query)) {
      return (
        <div className="rounded-2xl border border-dashed bg-card">
          <EmptyState
            icon={FolderOpen}
            title="Your library is empty"
            description="Generated speech and uploaded audio show up here."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => setUploadOpen(true)}>
                  <Upload />
                  Upload audio
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/app/text-to-speech">Generate speech</Link>
                </Button>
              </div>
            }
          />
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-dashed bg-card">
        <EmptyState
          icon={SearchX}
          title="Nothing matches these filters"
          description="Try another type, clear the search or turn off favorites only."
          action={
            <Button variant="outline" onClick={resetQuery}>
              Clear filters
            </Button>
          }
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <LibraryToolbar
        type={query.type}
        onTypeChange={updateQuery('type')}
        search={query.search}
        onSearchChange={updateQuery('search')}
        sort={query.sort}
        onSortChange={updateQuery('sort')}
        favoritesOnly={query.favoritesOnly}
        onFavoritesOnlyChange={updateQuery('favoritesOnly')}
        onUpload={() => setUploadOpen(true)}
      />

      {data ? (
        <p className="text-[12.5px] text-ink-3" aria-live="polite">
          {total.toLocaleString()} {total === 1 ? 'item' : 'items'}
        </p>
      ) : null}

      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}

      {renderItems()}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[12px] text-ink-3">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => current - 1)}
              disabled={page <= 1 || isFetching}
            >
              <ChevronLeft />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => current + 1)}
              disabled={page >= totalPages || isFetching}
            >
              Next
              <ChevronRight />
            </Button>
          </div>
        </div>
      ) : null}

      <UploadAudioDialog open={uploadOpen} onOpenChange={setUploadOpen} />

      <RenameDialog
        item={renaming}
        onRename={handleRename}
        isSaving={isRenaming}
        onOpenChange={(open) => {
          if (!open) setRenaming(null);
        }}
      />

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <div className="flex flex-col gap-1">
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.title}” will be removed from your library. This cannot
              be undone.
            </AlertDialogDescription>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
