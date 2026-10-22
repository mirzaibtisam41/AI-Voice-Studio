'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import { AuthFooterLink, AuthLayout } from '@/features/auth/AuthLayout';
import { emailError } from '@/features/auth/authValidation';
import { InputWithIcon } from '@/features/auth/InputWithIcon';
import { PasswordInput } from '@/features/auth/PasswordInput';
import { useDemoSignIn } from '@/features/auth/useDemoSignIn';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({});
  const { isSubmitting, signIn } = useDemoSignIn();

  const errors = {
    email: emailError(email),
    password: password ? null : 'Enter your password',
  };
  const visibleError = (field) => (touched[field] ? errors[field] : null);
  const markTouched = (field) =>
    setTouched((current) => ({ ...current, [field]: true }));

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched({ email: true, password: true });
    if (errors.email || errors.password) return;
    signIn({ email, message: 'Welcome back' });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue to your studio."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <AuthFooterLink href="/register">Sign up</AuthFooterLink>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field id="login-email" label="Email" error={visibleError('email')}>
          <InputWithIcon
            id="login-email"
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => markTouched('email')}
            aria-invalid={Boolean(visibleError('email'))}
            aria-describedby={
              visibleError('email') ? 'login-email-error' : undefined
            }
          />
        </Field>
        <div className="flex flex-col gap-2">
          <Field
            id="login-password"
            label="Password"
            error={visibleError('password')}
          >
            <PasswordInput
              id="login-password"
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() => markTouched('password')}
              aria-invalid={Boolean(visibleError('password'))}
              aria-describedby={
                visibleError('password') ? 'login-password-error' : undefined
              }
            />
          </Field>
          <Link
            href="/forgot-password"
            className="self-end text-[13px] font-medium text-brand underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : null}
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </Button>
        <p className="text-center text-[12.5px] text-ink-3">
          Demo mode — any valid email and password will work.
        </p>
      </form>
    </AuthLayout>
  );
}
