import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  balance: 412000,
  autoReload: false,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    creditsSpent(state, action) {
      state.balance = Math.max(0, state.balance - action.payload);
    },
    creditsAdded(state, action) {
      state.balance += action.payload;
    },
    autoReloadChanged(state, action) {
      state.autoReload = action.payload;
    },
  },
});

export const { creditsSpent, creditsAdded, autoReloadChanged } =
  walletSlice.actions;

export const walletReducer = walletSlice.reducer;

export const selectBalance = (state) => state.wallet.balance;
export const selectAutoReload = (state) => state.wallet.autoReload;
