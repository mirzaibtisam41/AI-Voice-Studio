'use client';

import { useDispatch, useSelector } from 'react-redux';
import { SIGNUP_CREDITS } from '@/constants/pricing';
import { creditsSpent, selectBalance } from '@/features/credits/walletSlice';

export function useCreditCharge() {
  const dispatch = useDispatch();
  const balance = useSelector(selectBalance);

  return {
    balance,
    canAfford: (cost) => cost <= balance,
    charge: (cost, details) => dispatch(creditsSpent(cost, details)),
    shortfallMessage: (cost) =>
      `This needs ${cost.toLocaleString()} credits but you have ${balance.toLocaleString()}. Every demo account starts with ${SIGNUP_CREDITS} credits.`,
  };
}
