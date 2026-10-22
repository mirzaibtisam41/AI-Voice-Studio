'use client';

import { useEffect, useRef, useState } from 'react';

export function useSimulatedAction(delayMs = 900) {
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const run = (onDone) => {
    setIsRunning(true);
    timerRef.current = window.setTimeout(() => {
      setIsRunning(false);
      onDone();
    }, delayMs);
  };

  return { isRunning, run };
}
