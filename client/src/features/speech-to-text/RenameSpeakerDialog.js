'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/input';

function RenameSpeakerForm({ currentName, onRename, onCancel }) {
  const [name, setName] = useState(currentName);
  const trimmed = name.trim();

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (trimmed) onRename(trimmed);
      }}
    >
      <Field id="speaker-name" label="Speaker name">
        <Input
          id="speaker-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={40}
          autoFocus
        />
      </Field>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!trimmed}>
          Save name
        </Button>
      </DialogFooter>
    </form>
  );
}

export function RenameSpeakerDialog({
  speaker,
  currentName,
  onRename,
  onClose,
}) {
  return (
    <Dialog
      open={Boolean(speaker)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogTitle>Rename speaker</DialogTitle>
        <DialogDescription>
          The new name replaces this label everywhere in the transcript.
        </DialogDescription>
        {speaker ? (
          <RenameSpeakerForm
            key={speaker}
            currentName={currentName}
            onRename={onRename}
            onCancel={onClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
