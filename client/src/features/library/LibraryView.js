'use client';

import { useState } from 'react';
import { SearchX } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/EmptyState';
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
import { LibraryCard } from '@/features/library/LibraryCard';
import { LibraryToolbar } from '@/features/library/LibraryToolbar';
import { RenameDialog } from '@/features/library/RenameDialog';
import { LIBRARY_ITEMS, queryLibraryItems } from '@/mocks/library';

const DEFAULT_QUERY = {
  type: 'all',
  search: '',
  sort: 'newest',
  favoritesOnly: false,
};

export function LibraryView() {
  const [items, setItems] = useState(LIBRARY_ITEMS);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [renaming, setRenaming] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const visibleItems = queryLibraryItems(items, query);

  const updateQuery = (key) => (value) =>
    setQuery((current) => ({ ...current, [key]: value }));

  const updateItem = (id, changes) =>
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );

  const handleRename = (title) => {
    updateItem(renaming.id, { title });
    setRenaming(null);
    toast.success('Item renamed');
  };

  const handleDelete = () => {
    setItems((current) => current.filter((item) => item.id !== deleting.id));
    toast.success(`Deleted “${deleting.title}”`);
    setDeleting(null);
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
      />

      <p className="text-[12.5px] text-ink-3" aria-live="polite">
        {visibleItems.length} of {items.length} items
      </p>

      {visibleItems.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleItems.map((item) => (
            <LibraryCard
              key={item.id}
              item={item}
              onToggleFavorite={() =>
                updateItem(item.id, { favorite: !item.favorite })
              }
              onDownload={() => toast.success(`Downloading “${item.title}”`)}
              onRename={() => setRenaming(item)}
              onDelete={() => setDeleting(item)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed bg-card">
          <EmptyState
            icon={SearchX}
            title="Nothing matches these filters"
            description="Try another type, clear the search or turn off favorites only."
            action={
              <Button variant="outline" onClick={() => setQuery(DEFAULT_QUERY)}>
                Clear filters
              </Button>
            }
          />
        </div>
      )}

      <RenameDialog
        item={renaming}
        onRename={handleRename}
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
