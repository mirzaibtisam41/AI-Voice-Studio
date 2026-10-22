'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

let playingId = null;
const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

function setPlayingId(id) {
  playingId = id;
  listeners.forEach((listener) => listener());
}

function getPlayingId() {
  return playingId;
}

function getServerPlayingId() {
  return null;
}

export function useMockPlayback(id, durationSeconds) {
  const currentId = useSyncExternalStore(
    subscribe,
    getPlayingId,
    getServerPlayingId,
  );
  const isPlaying = currentId === id;
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const startedAt = performance.now() - elapsedRef.current * 1000;
    const timer = window.setInterval(() => {
      const next = (performance.now() - startedAt) / 1000;

      if (next >= durationSeconds) {
        setElapsed(0);
        setPlayingId(null);
        return;
      }

      setElapsed(next);
    }, 100);

    return () => window.clearInterval(timer);
  }, [isPlaying, durationSeconds]);

  useEffect(
    () => () => {
      if (getPlayingId() === id) setPlayingId(null);
    },
    [id],
  );

  return {
    isPlaying,
    elapsed,
    progress: durationSeconds ? elapsed / durationSeconds : 0,
    toggle: () => setPlayingId(isPlaying ? null : id),
    stop: () => {
      setElapsed(0);
      if (isPlaying) setPlayingId(null);
    },
  };
}
