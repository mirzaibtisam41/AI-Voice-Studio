'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/layout/UserAvatar';
import { Field } from '@/components/ui/Field';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { Tag } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { selectCurrentUser, userUpdated } from '@/features/auth/authSlice';
import { saveDemoSession } from '@/features/auth/demoSession';
import { useSimulatedAction } from '@/features/settings/useSimulatedAction';
import { formatDate } from '@/lib/format';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateProfile({ name, email }) {
  const errors = {};

  if (!name) errors.name = 'Enter your full name.';
  if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.';

  return errors;
}

export function ProfileSettings() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [errors, setErrors] = useState({});
  const { isRunning, run } = useSimulatedAction();
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const isChanged =
    trimmedName !== (user?.name ?? '') || trimmedEmail !== (user?.email ?? '');

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateProfile({
      name: trimmedName,
      email: trimmedEmail,
    });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    run(() => {
      const changes = { name: trimmedName, email: trimmedEmail };

      dispatch(userUpdated(changes));
      saveDemoSession({ ...user, ...changes });
      setName(trimmedName);
      setEmail(trimmedEmail);
      toast.success('Profile updated');
    });
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
            {user?.joinedAt ? (
              <Tag>Joined {formatDate(user.joinedAt)}</Tag>
            ) : null}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field id="profile-name" label="Full name" error={errors.name}>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'profile-name-error' : undefined}
          />
        </Field>
        <Field
          id="profile-email"
          label="Email"
          error={errors.email}
          hint="Used for sign in and notifications."
        >
          <Input
            id="profile-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email ? 'profile-email-error' : 'profile-email-hint'
            }
          />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" disabled={!isChanged || isRunning}>
            {isRunning ? <Spinner /> : null}
            {isRunning ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
