'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

const state = { playingId: null, currentTime: 0, duration: 0, error: null };
const listeners = new Set();
let audioElement = null;
let snapshot = { ...state };

function notify() {
  snapshot = { ...state };
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

const SERVER_SNAPSHOT = { ...state };

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

function getAudioElement() {
  if (audioElement) return audioElement;

  audioElement = new Audio();
  audioElement.preload = 'none';
  audioElement.addEventListener('timeupdate', () => {
    state.currentTime = audioElement.currentTime;
    notify();
  });
  audioElement.addEventListener('loadedmetadata', () => {
    state.duration = Number.isFinite(audioElement.duration)
      ? audioElement.duration
      : 0;
    notify();
  });
  audioElement.addEventListener('ended', () => {
    state.playingId = null;
    state.currentTime = 0;
    notify();
  });
  audioElement.addEventListener('error', () => {
    state.playingId = null;
    state.error = 'This audio could not be played.';
    notify();
  });

  return audioElement;
}

function setPlayingId(id) {
  if (state.playingId !== id && audioElement && !audioElement.paused) {
    audioElement.pause();
  }

  state.playingId = id;
  notify();
}

function playSource(id, src) {
  const audio = getAudioElement();

  if (audio.dataset.playbackId !== id) {
    audio.pause();
    audio.src = src;
    audio.dataset.playbackId = id;
    state.currentTime = 0;
    state.duration = 0;
  }

  state.playingId = id;
  state.error = null;
  notify();
  audio.play().catch(() => {
    state.playingId = null;
    state.error = 'This audio could not be played.';
    notify();
  });
}

export function stopAllPlayback() {
  setPlayingId(null);
}

export function useAudioPlayback(id, { src, durationSeconds = 0 } = {}) {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const isPlaying = current.playingId === id;
  const isLoaded = audioElement?.dataset.playbackId === id;
  const duration =
    isLoaded && current.duration ? current.duration : durationSeconds;
  const elapsed = isLoaded ? current.currentTime : 0;

  useEffect(
    () => () => {
      if (getSnapshot().playingId === id) setPlayingId(null);
    },
    [id],
  );

  return {
    isPlaying,
    elapsed,
    duration,
    progress: duration ? Math.min(1, elapsed / duration) : 0,
    error: isLoaded ? current.error : null,
    toggle: () => {
      if (isPlaying) {
        setPlayingId(null);
        return;
      }

      playSource(id, src);
    },
    stop: () => {
      if (isPlaying) setPlayingId(null);
    },
  };
}

export function useMockPlayback(id, durationSeconds) {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const isPlaying = current.playingId === id;
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
      if (getSnapshot().playingId === id) setPlayingId(null);
    },
    [id],
  );

  return {
    isPlaying,
    elapsed,
    duration: durationSeconds,
    progress: durationSeconds ? elapsed / durationSeconds : 0,
    error: null,
    toggle: () => setPlayingId(isPlaying ? null : id),
    stop: () => {
      setElapsed(0);
      if (isPlaying) setPlayingId(null);
    },
  };
}

export function usePlayback(id, { src, durationSeconds = 0 } = {}) {
  const real = useAudioPlayback(id, { src, durationSeconds });
  const mock = useMockPlayback(id, durationSeconds);

  return src ? real : mock;
}
