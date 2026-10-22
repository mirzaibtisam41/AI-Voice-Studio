'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loggedOut, sessionStarted } from '@/features/auth/authSlice';
import { readDemoSession } from '@/features/auth/demoSession';

export function SessionBoot() {
  const dispatch = useDispatch();

  useEffect(() => {
    const user = readDemoSession();

    dispatch(user ? sessionStarted(user) : loggedOut());
  }, [dispatch]);

  return null;
}
