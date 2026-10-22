'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/lib/format';

const BYTES_PER_SECOND = 16000;

export function SampleRecorder({ onRecorded, disabled }) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [recordingCount, setRecordingCount] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => () => window.clearInterval(timerRef.current), []);

  function start() {
    setSeconds(0);
    setIsRecording(true);
    timerRef.current = window.setInterval(
      () => setSeconds((current) => current + 1),
      1000,
    );
  }

  function stop() {
    window.clearInterval(timerRef.current);
    const number = recordingCount + 1;
    const length = Math.max(1, seconds);

    setIsRecording(false);
    setRecordingCount(number);
    onRecorded({
      name: `Recording ${number}.webm`,
      size: length * BYTES_PER_SECOND,
      type: 'audio/webm',
    });
  }

  if (isRecording) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-danger/40 bg-danger/10 px-3 py-2.5">
        <span className="flex items-center gap-2.5 text-[13px] font-medium">
          <span className="relative flex size-2.5" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-danger opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-danger" />
          </span>
          Recording
          <span className="font-mono text-[12px] text-ink-3" aria-live="off">
            {formatDuration(seconds)}
          </span>
        </span>
        <Button variant="outline" size="sm" onClick={stop}>
          <Square className="fill-current" />
          Stop
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={start}
      disabled={disabled}
      className="self-start"
    >
      <Mic />
      Record sample
    </Button>
  );
}
