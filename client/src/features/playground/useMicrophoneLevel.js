'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

function createResources() {
  return { stream: null, context: null, frame: 0, muted: false };
}

function measureLevel(analyser, samples) {
  analyser.getByteTimeDomainData(samples);
  let sum = 0;

  for (const sample of samples) {
    const centered = (sample - 128) / 128;
    sum += centered * centered;
  }

  return Math.min(1, Math.sqrt(sum / samples.length) * 4);
}

export function useMicrophoneLevel(orbRef, meterRef) {
  const resourcesRef = useRef(null);
  const attemptRef = useRef(0);

  const applyLevel = useCallback(
    (level) => {
      if (orbRef.current) {
        orbRef.current.style.transform = level
          ? `scale(${1 + level * 0.22})`
          : '';
      }
      if (meterRef.current) {
        meterRef.current.style.width = `${Math.round(level * 100)}%`;
      }
    },
    [orbRef, meterRef],
  );

  const stop = useCallback(() => {
    attemptRef.current += 1;
    const { stream, context, frame } =
      resourcesRef.current ?? createResources();

    cancelAnimationFrame(frame);
    stream?.getTracks().forEach((track) => track.stop());
    if (context && context.state !== 'closed') {
      context.close().catch(() => {});
    }
    resourcesRef.current = createResources();
    applyLevel(0);
  }, [applyLevel]);

  const runLoop = useCallback(
    (readLevel) => {
      let smoothed = 0;

      const tick = () => {
        const resources = resourcesRef.current;
        const target = resources.muted ? 0 : readLevel();

        smoothed = smoothed * 0.7 + target * 0.3;
        applyLevel(smoothed);
        resources.frame = requestAnimationFrame(tick);
      };

      resourcesRef.current.frame = requestAnimationFrame(tick);
    },
    [applyLevel],
  );

  const startMicrophone = useCallback(async () => {
    stop();
    const attempt = attemptRef.current;
    const AudioContextClass =
      typeof window === 'undefined'
        ? null
        : (window.AudioContext ?? window.webkitAudioContext);

    if (!navigator.mediaDevices?.getUserMedia || !AudioContextClass) {
      return null;
    }

    let stream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      return null;
    }

    if (attempt !== attemptRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      return null;
    }

    const context = new AudioContextClass();
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    context.createMediaStreamSource(stream).connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);

    resourcesRef.current = { stream, context, frame: 0, muted: false };
    runLoop(() => measureLevel(analyser, samples));

    return stream;
  }, [runLoop, stop]);

  const setMuted = useCallback((muted) => {
    const resources = resourcesRef.current;

    if (!resources) return;

    resources.muted = muted;
    resources.stream?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
  }, []);

  useEffect(() => stop, [stop]);

  return useMemo(
    () => ({ startMicrophone, stop, setMuted }),
    [startMicrophone, stop, setMuted],
  );
}
