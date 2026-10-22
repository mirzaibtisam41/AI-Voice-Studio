'use client';

import { useDispatch } from 'react-redux';
import { useBalance } from '@/hooks/useBalance';
import { baseApi } from '@/store/baseApi';

export function useCreditCharge() {
  const dispatch = useDispatch();
  const { balance } = useBalance();

  return {
    balance,
    canAfford: (cost) => cost <= balance,
    charge: () => dispatch(baseApi.util.invalidateTags(['Wallet'])),
    shortfallMessage: (cost) =>
      `This needs ${cost.toLocaleString()} credits but you have ${balance.toLocaleString()}.`,
  };
}
