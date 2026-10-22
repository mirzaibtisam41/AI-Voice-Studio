'use client';

import { useSyncExternalStore } from 'react';

function subscribe(onChange) {
  const observer = new MutationObserver(onChange);

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function getServerSnapshot() {
  return 'dark';
}

export function useResolvedTheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
