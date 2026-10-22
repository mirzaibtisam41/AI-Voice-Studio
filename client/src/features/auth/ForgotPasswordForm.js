'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import { AuthFooterLink, AuthLayout } from '@/features/auth/AuthLayout';
import { emailError } from '@/features/auth/authValidation';
import { InputWithIcon } from '@/features/auth/InputWithIcon';
import { useForgotPasswordMutation } from '@/features/auth/authApi';
import { getErrorMessage } from '@/lib/apiError';

function SentState({ email, isResending, onResend }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-success/12 text-success">
          <MailCheck className="size-6" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1.5">
          <h2 className="font-serif text-xl font-medium">Check your inbox</h2>
          <p className="text-[13.5px] text-muted-foreground">
            We sent a reset link to
          </p>
          <p className="font-mono text-[13px] break-all">{email}</p>
        </div>
      </div>
      <Button asChild size="lg" className="w-full">
        <Link href="/login">
          <ArrowLeft />
          Back to log in
        </Link>
      </Button>
      <Button
        variant="ghost"
        className="w-full"
        disabled={isResending}
        onClick={onResend}
      >
        {isResending ? <Spinner /> : null}
        {isResending ? 'Resending…' : 'Resend'}
      </Button>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState('idle');
  const [forgotPassword] = useForgotPasswordMutation();

  const error = emailError(email);
  const visibleError = touched ? error : null;

  const sendLink = async () => {
    try {
      await forgotPassword({ email: email.trim() }).unwrap();

      return true;
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));

      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched(true);
    if (error) return;
    setStatus('sending');
    setStatus((await sendLink()) ? 'sent' : 'idle');
  };

  const handleResend = async () => {
    setStatus('resending');
    if (await sendLink()) toast.success('Reset link sent again');
    setStatus('sent');
  };

  const isSent = status === 'sent' || status === 'resending';

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll email you a reset link."
      footer={
        isSent ? null : (
          <>
            Remembered it? <AuthFooterLink href="/login">Log in</AuthFooterLink>
          </>
        )
      }
    >
      <div aria-live="polite">
        {isSent ? (
          <SentState
            email={email.trim()}
            isResending={status === 'resending'}
            onResend={handleResend}
          />
        ) : (
          <form
            noValidate
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            <Field id="forgot-email" label="Email" error={visibleError}>
              <InputWithIcon
                id="forgot-email"
                icon={Mail}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() => setTouched(true)}
                aria-invalid={Boolean(visibleError)}
                aria-describedby={
                  visibleError ? 'forgot-email-error' : undefined
                }
              />
            </Field>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={status === 'sending'}
            >
              {status === 'sending' ? <Spinner /> : null}
              {status === 'sending' ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
