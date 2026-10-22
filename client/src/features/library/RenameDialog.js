'use client';

import { useState } from 'react';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/Spinner';
import { LIBRARY_TITLE_MAX_LENGTH } from '@/features/library/libraryTypes';

function RenameForm({ item, onRename, onCancel, isSaving }) {
  const [title, setTitle] = useState(item.title);
  const trimmed = title.trim();
  const canSave = trimmed.length > 0 && trimmed !== item.title;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (canSave) onRename(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field id="library-rename" label="Name">
        <Input
          id="library-rename"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={LIBRARY_TITLE_MAX_LENGTH}
          autoFocus
        />
      </Field>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSave || isSaving}>
          {isSaving ? <Spinner /> : null}
          Save name
        </Button>
      </DialogFooter>
    </form>
  );
}

export function RenameDialog({ item, onRename, onOpenChange, isSaving }) {
  return (
    <Dialog open={Boolean(item)} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex flex-col gap-1">
          <DialogTitle>Rename item</DialogTitle>
          <DialogDescription>
            Give this item a name that is easy to find later.
          </DialogDescription>
        </div>
        {item ? (
          <RenameForm
            key={item.id}
            item={item}
            onRename={onRename}
            isSaving={isSaving}
            onCancel={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
