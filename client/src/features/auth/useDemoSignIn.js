'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { sessionStarted } from '@/features/auth/authSlice';
import { buildDemoUser, saveDemoSession } from '@/features/auth/demoSession';

const SIGN_IN_DELAY_MS = 900;

export function useDemoSignIn() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const signIn = ({ name, email, message }) => {
    setIsSubmitting(true);
    timerRef.current = setTimeout(() => {
      const user = buildDemoUser({ name, email });

      saveDemoSession(user);
      router.replace('/app');
      dispatch(sessionStarted(user));
      toast.success(message);
    }, SIGN_IN_DELAY_MS);
  };

  return { isSubmitting, signIn };
}
