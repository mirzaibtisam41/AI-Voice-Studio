'use client';

import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { loggedOut } from '@/features/auth/authSlice';
import { clearDemoSession } from '@/features/auth/demoSession';

export function useLogout() {
  const dispatch = useDispatch();
  const router = useRouter();

  return () => {
    clearDemoSession();
    dispatch(loggedOut());
    router.replace('/login');
  };
}
