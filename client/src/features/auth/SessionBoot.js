'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loggedOut, sessionStarted } from '@/features/auth/authSlice';
import { refreshSession } from '@/store/baseApi';

export function SessionBoot() {
  const dispatch = useDispatch();

  useEffect(() => {
    refreshSession().then((session) => {
      dispatch(session ? sessionStarted(session) : loggedOut());
    });
  }, [dispatch]);

  return null;
}
