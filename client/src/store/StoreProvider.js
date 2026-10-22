'use client';

import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { AUTH_STATUS } from '@/features/auth/authSlice';
import { saveDemoWallet } from '@/features/auth/demoSession';
import { makeStore } from '@/store/store';

export function StoreProvider({ children }) {
  const [store] = useState(makeStore);

  useEffect(() => {
    let savedWallet = null;

    return store.subscribe(() => {
      const { auth, wallet } = store.getState();

      if (auth.status !== AUTH_STATUS.LOGGED_IN || wallet === savedWallet) {
        return;
      }

      savedWallet = wallet;
      saveDemoWallet(wallet);
    });
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
