'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { ArrowLeft, CircleCheck, LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Spinner } from '@/components/ui/Spinner';
import { AuthFooterLink, AuthLayout } from '@/features/auth/AuthLayout';
import { useResetPasswordMutation } from '@/features/auth/authApi';
import { loggedOut } from '@/features/auth/authSlice';
import { newPasswordErrors } from '@/features/auth/authValidation';
import { PasswordInput } from '@/features/auth/PasswordInput';
import { PasswordRules } from '@/features/auth/PasswordRules';
import { getErrorMessage } from '@/lib/apiError';

export function AuthStatusCard({ tone, icon: Icon, title, children }) {
  const toneClass =
    tone === 'success'
      ? 'bg-success/12 text-success'
      : 'bg-danger/12 text-danger';

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-6 text-center">
      <span
        className={`flex size-12 items-center justify-center rounded-full ${toneClass}`}
      >
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className="font-serif text-xl font-medium">{title}</h2>
        <p className="text-[13.5px] text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

function InvalidLinkState({ message }) {
  return (
    <div className="flex flex-col gap-6">
      <AuthStatusCard tone="danger" icon={LinkIcon} title="Link not valid">
        {message}
      </AuthStatusCard>
      <Button asChild size="lg" className="w-full">
        <Link href="/forgot-password">Ask for a new link</Link>
      </Button>
    </div>
  );
}

function SuccessState() {
  return (
    <div className="flex flex-col gap-6">
      <AuthStatusCard
        tone="success"
        icon={CircleCheck}
        title="Password changed"
      >
        You were logged out everywhere. Log in with your new password.
      </AuthStatusCard>
      <Button asChild size="lg" className="w-full">
        <Link href="/login">
          <ArrowLeft />
          Go to log in
        </Link>
      </Button>
    </div>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const dispatch = useDispatch();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const errors = newPasswordErrors({ password, confirm });
  const visibleError = (field) => (touched[field] ? errors[field] : null);
  const markTouched = (field) =>
    setTouched((current) => ({ ...current, [field]: true }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched({ password: true, confirm: true });
    if (errors.password || errors.confirm) return;
    setError('');

    try {
      await resetPassword({ token, password }).unwrap();
      dispatch(loggedOut());
      setStatus('done');
    } catch (requestError) {
      if (requestError?.status === 400 && !requestError.data?.details) {
        setError(getErrorMessage(requestError));
        setStatus('invalid');

        return;
      }

      setError(getErrorMessage(requestError));
    }
  };

  if (!token || status === 'invalid') {
    return (
      <InvalidLinkState
        message={
          error ||
          'This reset link is missing its token. Open the link from your email again or ask for a new one.'
        }
      />
    );
  }

  if (status === 'done') return <SuccessState />;

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FormAlert>{error}</FormAlert>
      <Field
        id="reset-password"
        label="New password"
        error={visibleError('password')}
      >
        <PasswordInput
          id="reset-password"
          autoComplete="new-password"
          placeholder="Create a new password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={() => markTouched('password')}
          aria-invalid={Boolean(visibleError('password'))}
          aria-describedby={[
            visibleError('password') ? 'reset-password-error' : null,
            'reset-password-rules',
          ]
            .filter(Boolean)
            .join(' ')}
        />
        <PasswordRules id="reset-password-rules" password={password} />
      </Field>
      <Field
        id="reset-confirm"
        label="Confirm new password"
        error={visibleError('confirm')}
      >
        <PasswordInput
          id="reset-confirm"
          autoComplete="new-password"
          placeholder="Repeat the new password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          onBlur={() => markTouched('confirm')}
          aria-invalid={Boolean(visibleError('confirm'))}
          aria-describedby={
            visibleError('confirm') ? 'reset-confirm-error' : undefined
          }
        />
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? <Spinner /> : null}
        {isLoading ? 'Saving…' : 'Set new password'}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  return (
    <AuthLayout
      guestOnly={false}
      title="Choose a new password"
      subtitle="Pick something you don't use anywhere else."
      footer={
        <>
          Remembered it? <AuthFooterLink href="/login">Log in</AuthFooterLink>
        </>
      }
    >
      <div aria-live="polite">
        <Suspense fallback={<Spinner className="mx-auto size-5" />}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </AuthLayout>
  );
}
