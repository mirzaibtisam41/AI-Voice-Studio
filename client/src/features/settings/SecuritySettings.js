'use client';

import { useState } from 'react';
import { Laptop, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { Field } from '@/components/ui/Field';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ACTIVE_SESSIONS } from '@/features/settings/settingsOptions';
import { useSimulatedAction } from '@/features/settings/useSimulatedAction';

const EMPTY_PASSWORDS = { current: '', next: '', confirm: '' };

const PASSWORD_FIELDS = [
  {
    key: 'current',
    id: 'password-current',
    label: 'Current password',
    autoComplete: 'current-password',
  },
  {
    key: 'next',
    id: 'password-new',
    label: 'New password',
    autoComplete: 'new-password',
    hint: 'At least 8 characters with a number.',
  },
  {
    key: 'confirm',
    id: 'password-confirm',
    label: 'Confirm new password',
    autoComplete: 'new-password',
  },
];

function validatePasswords({ current, next, confirm }) {
  const errors = {};

  if (!current) errors.current = 'Enter your current password.';
  if (next.length < 8 || !/\d/.test(next)) {
    errors.next = 'Use at least 8 characters including a number.';
  } else if (next === current) {
    errors.next = 'Choose a password different from the current one.';
  }
  if (confirm !== next) errors.confirm = 'Passwords do not match.';

  return errors;
}

function ChangePasswordCard() {
  const [values, setValues] = useState(EMPTY_PASSWORDS);
  const [errors, setErrors] = useState({});
  const { isRunning, run } = useSimulatedAction(1100);
  const isFilled = Object.values(values).every(Boolean);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validatePasswords(values);

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    run(() => {
      setValues(EMPTY_PASSWORDS);
      toast.success('Password updated');
    });
  };

  return (
    <Panel
      title="Change password"
      description="You will stay signed in on this device."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {PASSWORD_FIELDS.map((field) => (
          <Field
            key={field.key}
            id={field.id}
            label={field.label}
            error={errors[field.key]}
            hint={field.hint}
          >
            <Input
              id={field.id}
              type="password"
              value={values[field.key]}
              autoComplete={field.autoComplete}
              aria-invalid={Boolean(errors[field.key])}
              aria-describedby={
                errors[field.key]
                  ? `${field.id}-error`
                  : field.hint
                    ? `${field.id}-hint`
                    : undefined
              }
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }))
              }
            />
          </Field>
        ))}
        <div className="flex justify-end">
          <Button type="submit" disabled={!isFilled || isRunning}>
            {isRunning ? <Spinner /> : null}
            {isRunning ? 'Updating...' : 'Update password'}
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function ActiveSessionsCard() {
  const [sessions, setSessions] = useState(ACTIVE_SESSIONS);
  const hasOtherSessions = sessions.some((session) => !session.current);

  const revoke = (session) => {
    setSessions((current) => current.filter((item) => item.id !== session.id));
    toast.success(`Signed out of ${session.device}`);
  };

  const revokeOthers = () => {
    setSessions((current) => current.filter((item) => item.current));
    toast.success('Logged out of all other sessions');
  };

  return (
    <Panel
      title="Active sessions"
      description="Devices currently signed in to your account."
      action={
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={revokeOthers}
          disabled={!hasOtherSessions}
        >
          Log out other sessions
        </Button>
      }
    >
      <ul className="flex flex-col divide-y">
        {sessions.map((session) => {
          const Icon = session.kind === 'mobile' ? Smartphone : Laptop;

          return (
            <li
              key={session.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-field text-muted-foreground">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">
                  {session.device}
                </p>
                <p className="truncate text-[12px] text-ink-3">
                  {session.location} · {session.lastActive}
                </p>
              </div>
              {session.current ? (
                <StatusBadge tone="success">Current</StatusBadge>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger hover:text-danger"
                  onClick={() => revoke(session)}
                  aria-label={`Revoke ${session.device}`}
                >
                  Revoke
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

export function SecuritySettings() {
  return (
    <div className="flex flex-col gap-4">
      <ChangePasswordCard />
      <ActiveSessionsCard />
    </div>
  );
}
