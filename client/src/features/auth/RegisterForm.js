'use client';

import { useState } from 'react';
import { Check, Mail, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import { AuthFooterLink, AuthLayout } from '@/features/auth/AuthLayout';
import {
  PASSWORD_RULES,
  emailError,
  isStrongPassword,
  nameError,
} from '@/features/auth/authValidation';
import { InputWithIcon } from '@/features/auth/InputWithIcon';
import { PasswordInput } from '@/features/auth/PasswordInput';
import { useDemoSignIn } from '@/features/auth/useDemoSignIn';
import { cn } from '@/lib/utils';

function PasswordRules({ id, password }) {
  return (
    <ul
      id={id}
      aria-label="Password requirements"
      className="flex flex-col gap-1"
    >
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);
        const Icon = passed ? Check : X;

        return (
          <li
            key={rule.id}
            className={cn(
              'flex items-center gap-2 text-[12.5px]',
              passed ? 'text-success' : 'text-ink-3',
            )}
          >
            <Icon className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
            {rule.label}
            <span className="sr-only">{passed ? 'met' : 'not met'}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [touched, setTouched] = useState({});
  const { isSubmitting, signIn } = useDemoSignIn();

  const errors = {
    name: nameError(name),
    email: emailError(email),
    password: isStrongPassword(password)
      ? null
      : 'Password does not meet the requirements',
    terms: acceptedTerms ? null : 'Please accept the terms to continue',
  };
  const visibleError = (field) => (touched[field] ? errors[field] : null);
  const markTouched = (field) =>
    setTouched((current) => ({ ...current, [field]: true }));
  const describedBy = (field, extra) =>
    [visibleError(field) ? `register-${field}-error` : null, extra]
      .filter(Boolean)
      .join(' ') || undefined;

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched({ name: true, email: true, password: true, terms: true });
    if (Object.values(errors).some(Boolean)) return;
    signIn({ name, email, message: 'Welcome to AI Voice Studio' });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="50 free credits, no card required."
      footer={
        <>
          Already have an account?{' '}
          <AuthFooterLink href="/login">Log in</AuthFooterLink>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field
          id="register-name"
          label="Full name"
          error={visibleError('name')}
        >
          <InputWithIcon
            id="register-name"
            icon={User}
            autoComplete="name"
            placeholder="Jordan Lee"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => markTouched('name')}
            aria-invalid={Boolean(visibleError('name'))}
            aria-describedby={describedBy('name')}
          />
        </Field>
        <Field id="register-email" label="Email" error={visibleError('email')}>
          <InputWithIcon
            id="register-email"
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => markTouched('email')}
            aria-invalid={Boolean(visibleError('email'))}
            aria-describedby={describedBy('email')}
          />
        </Field>
        <Field
          id="register-password"
          label="Password"
          error={visibleError('password')}
        >
          <PasswordInput
            id="register-password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={() => markTouched('password')}
            aria-invalid={Boolean(visibleError('password'))}
            aria-describedby={describedBy(
              'password',
              'register-password-rules',
            )}
          />
          <PasswordRules id="register-password-rules" password={password} />
        </Field>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="register-terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => {
                setAcceptedTerms(checked === true);
                markTouched('terms');
              }}
              aria-invalid={Boolean(visibleError('terms'))}
              aria-describedby={describedBy('terms')}
              className="mt-0.5"
            />
            <label
              htmlFor="register-terms"
              className="text-[13px] leading-snug text-muted-foreground"
            >
              I agree to the{' '}
              <a
                href="#"
                className="text-foreground underline-offset-4 hover:underline"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="#"
                className="text-foreground underline-offset-4 hover:underline"
              >
                Privacy Policy
              </a>
            </label>
          </div>
          {visibleError('terms') ? (
            <p
              id="register-terms-error"
              role="alert"
              className="text-xs text-danger"
            >
              {visibleError('terms')}
            </p>
          ) : null}
        </div>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : null}
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
