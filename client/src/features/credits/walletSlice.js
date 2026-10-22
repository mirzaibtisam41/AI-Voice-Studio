import { createSlice } from '@reduxjs/toolkit';
import { SIGNUP_CREDITS } from '@/constants/pricing';

const initialState = {
  balance: 0,
  transactions: [],
};

function buildEntry(amount, { description, feature }) {
  return {
    payload: {
      id: `tx_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      amount,
      description,
      feature,
    },
  };
}

function applyEntry(state, entry) {
  state.balance = Math.max(0, state.balance + entry.amount);
  state.transactions.unshift({ ...entry, balanceAfter: state.balance });
}

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    walletStarted: {
      reducer(state, action) {
        state.balance = 0;
        state.transactions = [];
        applyEntry(state, action.payload);
      },
      prepare: () =>
        buildEntry(SIGNUP_CREDITS, {
          description: 'Signup bonus',
          feature: 'bonus',
        }),
    },
    walletRestored(state, action) {
      state.balance = action.payload.balance;
      state.transactions = action.payload.transactions;
    },
    walletCleared() {
      return initialState;
    },
    creditsSpent: {
      reducer(state, action) {
        applyEntry(state, action.payload);
      },
      prepare: (amount, details) => buildEntry(-amount, details),
    },
    creditsAdded: {
      reducer(state, action) {
        applyEntry(state, action.payload);
      },
      prepare: (amount, details) => buildEntry(amount, details),
    },
  },
});

export const {
  walletStarted,
  walletRestored,
  walletCleared,
  creditsSpent,
  creditsAdded,
} = walletSlice.actions;

export const walletReducer = walletSlice.reducer;

export const selectBalance = (state) => state.wallet.balance;
export const selectTransactions = (state) => state.wallet.transactions;
