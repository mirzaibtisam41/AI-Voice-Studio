'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { PageLoader } from '@/components/layout/PageLoader';
import {
  AUTH_STATUS,
  selectAuthStatus,
  selectCurrentUser,
} from '@/features/auth/authSlice';

export function AuthGuard({ adminOnly = false, children }) {
  const router = useRouter();
  const status = useSelector(selectAuthStatus);
  const user = useSelector(selectCurrentUser);
  const isAllowed =
    status === AUTH_STATUS.LOGGED_IN && (!adminOnly || user.role === 'admin');

  useEffect(() => {
    if (status === AUTH_STATUS.LOGGED_OUT) router.replace('/login');
    if (status === AUTH_STATUS.LOGGED_IN && !isAllowed) router.replace('/app');
  }, [status, isAllowed, router]);

  if (!isAllowed) return <PageLoader />;

  return children;
}
