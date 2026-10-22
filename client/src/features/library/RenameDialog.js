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

function RenameForm({ item, onRename, onCancel }) {
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
          maxLength={80}
          autoFocus
        />
      </Field>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSave}>
          Save name
        </Button>
      </DialogFooter>
    </form>
  );
}

export function RenameDialog({ item, onRename, onOpenChange }) {
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
            onCancel={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
