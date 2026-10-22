'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
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
import { loggedOut } from '@/features/auth/authSlice';
import { PasswordInput } from '@/features/auth/PasswordInput';
import { useDeactivateMyAccountMutation } from '@/features/settings/settingsApi';
import { getErrorMessage } from '@/lib/apiError';

function DeactivateDialog({ open, onOpenChange }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [deactivate, { isLoading }] = useDeactivateMyAccountMutation();

  const handleOpenChange = (next) => {
    if (isLoading) return;
    if (!next) {
      setPassword('');
      setError('');
    }
    onOpenChange(next);
  };

  const handleConfirm = async (event) => {
    event.preventDefault();
    if (!password) {
      setError('Enter your password to confirm.');

      return;
    }
    setError('');

    try {
      await deactivate({ password }).unwrap();
      toast.success('Your account has been deactivated');
      dispatch(loggedOut());
      router.replace('/login');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <form onSubmit={handleConfirm} noValidate className="contents">
          <div className="flex flex-col gap-1">
            <AlertDialogTitle>Deactivate your account?</AlertDialogTitle>
            <AlertDialogDescription>
              You are signed out on every device and can no longer log in. Your
              voice agents stop answering. Contact support if you want the
              account back.
            </AlertDialogDescription>
          </div>
          <Field id="deactivate-password" label="Your password" error={error}>
            <PasswordInput
              id="deactivate-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'deactivate-password-error' : undefined}
            />
          </Field>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isLoading}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              variant="destructive"
              disabled={!password || isLoading}
            >
              {isLoading ? <Spinner /> : null}
              {isLoading ? 'Deactivating...' : 'Deactivate account'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DangerZone() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-danger/40 bg-danger/5 p-4 sm:p-5">
      <div>
        <h2 className="text-[14px] font-semibold text-danger">Danger zone</h2>
        <p className="text-[12.5px] text-ink-3">
          These actions are hard to undo.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold">Deactivate account</p>
          <p className="text-[12.5px] text-ink-3">
            Sign out everywhere and lock your account. You will need your
            password to confirm.
          </p>
        </div>
        <div className="shrink-0">
          <Button variant="destructive" onClick={() => setIsDialogOpen(true)}>
            Deactivate account
          </Button>
        </div>
      </div>

      <DeactivateDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </section>
  );
}
