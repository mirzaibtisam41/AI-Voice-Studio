'use client';

import { useRouter } from 'next/navigation';
import { useLogoutMutation } from '@/features/auth/authApi';

export function useLogout() {
  const router = useRouter();
  const [logout] = useLogoutMutation();

  return async () => {
    await logout();
    router.replace('/login');
  };
}
