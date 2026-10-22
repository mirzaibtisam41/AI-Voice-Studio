'use client';

import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { loggedOut } from '@/features/auth/authSlice';
import { clearDemoSession } from '@/features/auth/demoSession';
import { walletCleared } from '@/features/credits/walletSlice';

export function useLogout() {
  const dispatch = useDispatch();
  const router = useRouter();

  return () => {
    clearDemoSession();
    dispatch(loggedOut());
    dispatch(walletCleared());
    router.replace('/login');
  };
}
