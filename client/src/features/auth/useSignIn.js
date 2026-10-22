'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useLoginMutation, useRegisterMutation } from '@/features/auth/authApi';
import { getErrorMessage } from '@/lib/apiError';

export function useSignIn() {
  const router = useRouter();
  const [register, registerState] = useRegisterMutation();
  const [login, loginState] = useLoginMutation();
  const [error, setError] = useState('');

  const signIn = async ({ name, email, password, isNewAccount, message }) => {
    setError('');

    try {
      if (isNewAccount) {
        await register({ name, email, password }).unwrap();
      }

      await login({ email, password }).unwrap();
      router.replace('/app');
      toast.success(message);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return {
    isSubmitting: registerState.isLoading || loginState.isLoading,
    signIn,
    error,
  };
}
