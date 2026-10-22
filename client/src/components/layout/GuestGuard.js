'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { PageLoader } from '@/components/layout/PageLoader';
import { AUTH_STATUS, selectAuthStatus } from '@/features/auth/authSlice';

export function GuestGuard({ children }) {
  const router = useRouter();
  const status = useSelector(selectAuthStatus);

  useEffect(() => {
    if (status === AUTH_STATUS.LOGGED_IN) router.replace('/app');
  }, [status, router]);

  if (status !== AUTH_STATUS.LOGGED_OUT) return <PageLoader />;

  return children;
}
