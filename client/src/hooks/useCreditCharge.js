'use client';

import { useDispatch, useSelector } from 'react-redux';
import { creditsSpent, selectBalance } from '@/features/credits/walletSlice';

export function useCreditCharge() {
  const dispatch = useDispatch();
  const balance = useSelector(selectBalance);

  return {
    balance,
    canAfford: (cost) => cost <= balance,
    charge: (cost) => dispatch(creditsSpent(cost)),
    shortfallMessage: (cost) =>
      `This needs ${cost.toLocaleString()} credits but you have ${balance.toLocaleString()}. Add credits to continue.`,
  };
}
