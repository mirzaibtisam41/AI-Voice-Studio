'use client';

import { useGetMyWalletQuery } from '@/features/credits/walletApi';

export function useBalance() {
  const { data, isLoading } = useGetMyWalletQuery();

  return { balance: data?.balance ?? 0, isLoading };
}
