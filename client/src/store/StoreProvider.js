'use client';

import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { setupListeners } from '@reduxjs/toolkit/query';
import { makeStore } from '@/store/store';

export function StoreProvider({ children }) {
  const [store] = useState(makeStore);

  useEffect(() => setupListeners(store.dispatch), [store]);

  return <Provider store={store}>{children}</Provider>;
}
