'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/layout/UserAvatar';
import { Field } from '@/components/ui/Field';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge, Tag } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResendVerificationMutation } from '@/features/auth/authApi';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useUpdateMyProfileMutation } from '@/features/settings/settingsApi';
import { getErrorMessage } from '@/lib/apiError';
import { formatDate } from '@/lib/format';

const NAME_MAX_LENGTH = 150;

function nameError(name) {
  if (!name) return 'Enter your full name.';
  if (name.length > NAME_MAX_LENGTH) {
    return `Use at most ${NAME_MAX_LENGTH} characters.`;
  }

  return undefined;
}

function EmailConfirmation({ user }) {
  const [resendVerification, { isLoading }] = useResendVerificationMutation();

  if (user?.emailVerifiedAt) return null;

  const handleResend = async () => {
    try {
      await resendVerification().unwrap();
      toast.success(`Confirmation link sent to ${user.email}`);
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-warning/40 bg-warning/5 p-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[12.5px] text-muted-foreground">
        Confirm your email so we can reach you about your account.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0"
        onClick={handleResend}
        disabled={isLoading}
      >
        {isLoading ? <Spinner /> : null}
        {isLoading ? 'Sending...' : 'Resend confirmation'}
      </Button>
    </div>
  );
}

export function ProfileSettings() {
  const user = useSelector(selectCurrentUser);
  const [name, setName] = useState(user?.name ?? '');
  const [error, setError] = useState();
  const [updateProfile, { isLoading }] = useUpdateMyProfileMutation();
  const trimmedName = name.trim();
  const isChanged = trimmedName !== (user?.name ?? '');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextError = nameError(trimmedName);

    setError(nextError);
    if (nextError) return;

    try {
      const updated = await updateProfile({ name: trimmedName }).unwrap();

      setName(updated.name);
      toast.success('Profile saved');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <Panel title="Profile" description="How you appear across the studio.">
      <div className="flex items-center gap-4 rounded-xl border bg-field/50 p-4">
        <UserAvatar
          name={trimmedName || user?.name}
          className="size-14 text-[18px]"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{user?.name}</p>
          <p className="truncate text-[12.5px] text-ink-3">{user?.email}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {user?.createdAt ? (
              <Tag>Joined {formatDate(user.createdAt)}</Tag>
            ) : null}
            {user?.emailVerifiedAt ? (
              <StatusBadge tone="success">Email confirmed</StatusBadge>
            ) : (
              <StatusBadge tone="warning">Email not confirmed</StatusBadge>
            )}
          </div>
        </div>
      </div>

      <EmailConfirmation user={user} />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field id="profile-name" label="Full name" error={error}>
          <Input
            id="profile-name"
            value={name}
            maxLength={NAME_MAX_LENGTH}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'profile-name-error' : undefined}
          />
        </Field>
        <Field
          id="profile-email"
          label="Email"
          hint="Used for sign in and notifications. It can't be changed here."
        >
          <Input
            id="profile-email"
            type="email"
            value={user?.email ?? ''}
            readOnly
            aria-describedby="profile-email-hint"
            className="text-muted-foreground"
          />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" disabled={!isChanged || isLoading}>
            {isLoading ? <Spinner /> : null}
            {isLoading ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
