import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { authReducer, loggedOut } from '@/features/auth/authSlice';
import { walletReducer } from '@/features/credits/walletSlice';
import { baseApi } from '@/store/baseApi';

const clearCacheOnLogout = createListenerMiddleware();

clearCacheOnLogout.startListening({
  actionCreator: loggedOut,
  effect: (_action, listenerApi) => {
    listenerApi.dispatch(baseApi.util.resetApiState());
  },
});

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      wallet: walletReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(clearCacheOnLogout.middleware)
        .concat(baseApi.middleware),
  });
}
