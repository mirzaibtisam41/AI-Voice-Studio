'use client';

import { useState } from 'react';
import { Laptop, MonitorSmartphone, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetSessionsQuery,
  useLogoutOtherSessionsMutation,
  useRevokeSessionMutation,
} from '@/features/auth/authApi';
import { newPasswordErrors } from '@/features/auth/authValidation';
import { PasswordInput } from '@/features/auth/PasswordInput';
import { PasswordRules } from '@/features/auth/PasswordRules';
import { useChangeMyPasswordMutation } from '@/features/settings/settingsApi';
import { describeDevice } from '@/features/settings/describeDevice';
import { getErrorMessage } from '@/lib/apiError';
import { formatDateTime } from '@/lib/format';

const EMPTY_PASSWORDS = { current: '', next: '', confirm: '' };

function validatePasswords({ current, next, confirm }) {
  const errors = {};
  const ruleErrors = newPasswordErrors({ password: next, confirm });

  if (!current) errors.current = 'Enter your current password.';
  if (ruleErrors.password) {
    errors.next = 'Password does not meet the requirements.';
  } else if (next === current) {
    errors.next = 'Choose a password different from the current one.';
  }
  if (ruleErrors.confirm) errors.confirm = 'Passwords do not match.';

  return errors;
}

function PasswordField({ id, label, autoComplete, error, value, onChange }) {
  return (
    <Field id={id} label={label} error={error}>
      <PasswordInput
        id={id}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

function ChangePasswordCard() {
  const [values, setValues] = useState(EMPTY_PASSWORDS);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [changePassword, { isLoading }] = useChangeMyPasswordMutation();
  const isFilled = Object.values(values).every(Boolean);

  const update = (key) => (value) =>
    setValues((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validatePasswords(values);

    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const result = await changePassword({
        currentPassword: values.current,
        newPassword: values.next,
      }).unwrap();

      setValues(EMPTY_PASSWORDS);
      toast.success(
        result?.loggedOutCount
          ? `Password changed. ${result.loggedOutCount} other ${result.loggedOutCount === 1 ? 'session was' : 'sessions were'} logged out.`
          : 'Password changed',
      );
    } catch (requestError) {
      setFormError(getErrorMessage(requestError));
    }
  };

  return (
    <Panel
      title="Change password"
      description="You stay signed in here. Other devices are logged out."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormAlert>{formError}</FormAlert>
        <PasswordField
          id="password-current"
          label="Current password"
          autoComplete="current-password"
          error={errors.current}
          value={values.current}
          onChange={update('current')}
        />
        <div className="flex flex-col gap-2">
          <PasswordField
            id="password-new"
            label="New password"
            autoComplete="new-password"
            error={errors.next}
            value={values.next}
            onChange={update('next')}
          />
          <PasswordRules id="password-new-rules" password={values.next} />
        </div>
        <PasswordField
          id="password-confirm"
          label="Confirm new password"
          autoComplete="new-password"
          error={errors.confirm}
          value={values.confirm}
          onChange={update('confirm')}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={!isFilled || isLoading}>
            {isLoading ? <Spinner /> : null}
            {isLoading ? 'Updating...' : 'Update password'}
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function SessionRow({ session }) {
  const [revokeSession, { isLoading }] = useRevokeSessionMutation();
  const device = describeDevice(session.userAgent);
  const Icon = device.isMobile ? Smartphone : Laptop;

  const revoke = async () => {
    try {
      await revokeSession(session.familyId).unwrap();
      toast.success(`Signed out of ${device.label}`);
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    }
  };

  return (
    <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-field text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium">{device.label}</p>
        <p className="truncate text-[12px] text-ink-3">
          {[
            session.ipAddress,
            `Signed in ${formatDateTime(session.lastActiveAt)}`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
      {session.isCurrent ? (
        <StatusBadge tone="success">This device</StatusBadge>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="text-danger hover:text-danger"
          onClick={revoke}
          disabled={isLoading}
          aria-label={`Revoke ${device.label}`}
        >
          {isLoading ? <Spinner /> : null}
          Revoke
        </Button>
      )}
    </li>
  );
}

function SessionsSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-label="Loading sessions">
      {[0, 1].map((index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActiveSessionsCard() {
  const {
    data: sessions = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSessionsQuery();
  const [logoutOthers, { isLoading: isLoggingOut }] =
    useLogoutOtherSessionsMutation();
  const hasOtherSessions = sessions.some((session) => !session.isCurrent);
  const orderedSessions = [...sessions].sort(
    (first, second) => Number(second.isCurrent) - Number(first.isCurrent),
  );

  const revokeOthers = async () => {
    try {
      await logoutOthers().unwrap();
      toast.success('Logged out of all other sessions');
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    }
  };

  let content;

  if (isLoading) {
    content = <SessionsSkeleton />;
  } else if (isError) {
    content = (
      <EmptyState
        icon={MonitorSmartphone}
        title="Could not load sessions"
        description={getErrorMessage(error)}
        action={
          <Button variant="outline" size="sm" onClick={refetch}>
            Try again
          </Button>
        }
      />
    );
  } else if (orderedSessions.length === 0) {
    content = (
      <EmptyState
        icon={MonitorSmartphone}
        title="No active sessions"
        description="Devices you sign in on appear here."
      />
    );
  } else {
    content = (
      <ul className="flex flex-col divide-y">
        {orderedSessions.map((session) => (
          <SessionRow key={session.familyId} session={session} />
        ))}
      </ul>
    );
  }

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
          disabled={!hasOtherSessions || isLoggingOut}
        >
          {isLoggingOut ? <Spinner /> : null}
          Log out other sessions
        </Button>
      }
    >
      {content}
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
