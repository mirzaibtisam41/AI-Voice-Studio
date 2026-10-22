'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useLogout } from '@/features/auth/useLogout';
import { useSimulatedAction } from '@/features/settings/useSimulatedAction';

function DangerRow({ title, description, action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[13.5px] font-semibold">{title}</p>
        <p className="text-[12.5px] text-ink-3">{description}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

function DeactivateDialog({ open, onOpenChange, email }) {
  const logout = useLogout();
  const [typed, setTyped] = useState('');
  const { isRunning, run } = useSimulatedAction(1200);
  const matches = typed.trim().toLowerCase() === email.toLowerCase();

  const handleOpenChange = (next) => {
    if (isRunning) return;
    if (!next) setTyped('');
    onOpenChange(next);
  };

  const handleConfirm = () =>
    run(() => {
      toast.success('Your account has been deactivated');
      logout();
    });

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <div className="flex flex-col gap-1">
          <AlertDialogTitle>Deactivate your account?</AlertDialogTitle>
          <AlertDialogDescription>
            Your voice agents stop answering, your API keys are revoked and you
            are signed out everywhere. You can reactivate within 30 days.
          </AlertDialogDescription>
        </div>
        <Field id="deactivate-confirm" label={`Type ${email} to confirm`}>
          <Input
            id="deactivate-confirm"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
            placeholder={email}
          />
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRunning}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!matches || isRunning}
          >
            {isRunning ? <Spinner /> : null}
            {isRunning ? 'Deactivating...' : 'Deactivate account'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteAudioDialog({ open, onOpenChange }) {
  const { isRunning, run } = useSimulatedAction(1000);

  const handleConfirm = () =>
    run(() => {
      toast.success('All audio deleted from your library');
      onOpenChange(false);
    });

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!isRunning) onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <div className="flex flex-col gap-1">
          <AlertDialogTitle>Delete all audio?</AlertDialogTitle>
          <AlertDialogDescription>
            Every generated file, upload and transcription in your library is
            permanently removed. Cloned voices and credits are kept.
          </AlertDialogDescription>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRunning}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isRunning}
          >
            {isRunning ? <Spinner /> : null}
            {isRunning ? 'Deleting...' : 'Delete all audio'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DangerZone() {
  const user = useSelector(selectCurrentUser);
  const [openDialog, setOpenDialog] = useState(null);

  const dialogHandler = (name) => (open) => setOpenDialog(open ? name : null);

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-danger/40 bg-danger/5 p-4 sm:p-5">
      <div>
        <h2 className="text-[14px] font-semibold text-danger">Danger zone</h2>
        <p className="text-[12.5px] text-ink-3">
          These actions are permanent or hard to undo.
        </p>
      </div>
      <DangerRow
        title="Delete all audio"
        description="Remove every file in your Audio Library. Credits are not refunded."
        action={
          <Button
            variant="outline"
            className="border-danger/40 text-danger hover:bg-danger/10 hover:text-danger"
            onClick={() => setOpenDialog('delete-audio')}
          >
            Delete all audio
          </Button>
        }
      />
      <div className="border-t border-danger/20" />
      <DangerRow
        title="Deactivate account"
        description="Sign out everywhere and pause your account. Your remaining credits are kept for 30 days."
        action={
          <Button
            variant="destructive"
            onClick={() => setOpenDialog('deactivate')}
          >
            Deactivate account
          </Button>
        }
      />

      <DeleteAudioDialog
        open={openDialog === 'delete-audio'}
        onOpenChange={dialogHandler('delete-audio')}
      />
      <DeactivateDialog
        open={openDialog === 'deactivate'}
        onOpenChange={dialogHandler('deactivate')}
        email={user?.email ?? ''}
      />
    </section>
  );
}
