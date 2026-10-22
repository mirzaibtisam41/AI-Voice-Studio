'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { CircleCheck, LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';
import { AuthLayout } from '@/features/auth/AuthLayout';
import { useVerifyEmailMutation } from '@/features/auth/authApi';
import {
  AUTH_STATUS,
  selectAuthStatus,
  userUpdated,
} from '@/features/auth/authSlice';
import { AuthStatusCard } from '@/features/auth/ResetPasswordForm';
import { getErrorMessage } from '@/lib/apiError';

const MISSING_TOKEN_MESSAGE =
  'This confirmation link is missing its token. Open the link from your email again.';

function NextStepButton({ variant }) {
  const authStatus = useSelector(selectAuthStatus);
  const isLoggedIn = authStatus === AUTH_STATUS.LOGGED_IN;

  return (
    <Button asChild size="lg" variant={variant} className="w-full">
      <Link href={isLoggedIn ? '/app' : '/login'}>
        {isLoggedIn ? 'Go to the studio' : 'Go to log in'}
      </Link>
    </Button>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const dispatch = useDispatch();
  const authStatus = useSelector(selectAuthStatus);
  const [verifyEmail] = useVerifyEmailMutation();
  const [result, setResult] = useState(
    token ? { status: 'verifying' } : { status: 'failed', message: '' },
  );
  const startedRef = useRef(false);

  useEffect(() => {
    if (!token || startedRef.current) return;
    startedRef.current = true;

    verifyEmail(token)
      .unwrap()
      .then((data) => setResult({ status: 'verified', data }))
      .catch((requestError) =>
        setResult({ status: 'failed', message: getErrorMessage(requestError) }),
      );
  }, [token, verifyEmail]);

  useEffect(() => {
    if (result.status !== 'verified') return;
    if (authStatus !== AUTH_STATUS.LOGGED_IN) return;
    dispatch(userUpdated({ emailVerifiedAt: result.data.emailVerifiedAt }));
  }, [result, authStatus, dispatch]);

  if (result.status === 'verifying') {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-6 text-center text-[13.5px] text-muted-foreground"
      >
        <Spinner className="size-5" />
        Confirming your email…
      </div>
    );
  }

  if (result.status === 'verified') {
    return (
      <div className="flex flex-col gap-6">
        <AuthStatusCard
          tone="success"
          icon={CircleCheck}
          title="Email confirmed"
        >
          {result.data?.email
            ? `${result.data.email} is confirmed. You're all set.`
            : "Your email is confirmed. You're all set."}
        </AuthStatusCard>
        <NextStepButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AuthStatusCard tone="danger" icon={LinkIcon} title="Link not valid">
        {result.message || MISSING_TOKEN_MESSAGE}
      </AuthStatusCard>
      <p className="text-center text-[13px] text-muted-foreground">
        Log in and use “Resend confirmation” in Settings to get a new link.
      </p>
      <NextStepButton />
    </div>
  );
}

export function VerifyEmailView() {
  return (
    <AuthLayout
      guestOnly={false}
      title="Confirm your email"
      subtitle="One click and your account is confirmed."
    >
      <div aria-live="polite">
        <Suspense fallback={<Spinner className="mx-auto size-5" />}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </AuthLayout>
  );
}
