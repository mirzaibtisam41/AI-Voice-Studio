import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '@/features/auth/authSlice';
import { walletReducer } from '@/features/credits/walletSlice';

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      wallet: walletReducer,
    },
  });
}
