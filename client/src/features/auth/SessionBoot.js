'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loggedOut, sessionStarted } from '@/features/auth/authSlice';
import { readDemoSession, readDemoWallet } from '@/features/auth/demoSession';
import { walletRestored, walletStarted } from '@/features/credits/walletSlice';

export function SessionBoot() {
  const dispatch = useDispatch();

  useEffect(() => {
    const user = readDemoSession();

    if (!user) {
      dispatch(loggedOut());
      return;
    }

    const wallet = readDemoWallet();

    dispatch(wallet ? walletRestored(wallet) : walletStarted());
    dispatch(sessionStarted(user));
  }, [dispatch]);

  return null;
}
