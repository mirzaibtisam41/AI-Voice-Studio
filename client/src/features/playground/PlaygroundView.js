'use client';

import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Mic, MicOff, PhoneOff, Play } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { CREDITS_PER_MINUTE } from '@/constants/pricing';
import { creditsSpent } from '@/features/credits/walletSlice';
import { ConnectionPanel } from '@/features/playground/ConnectionPanel';
import {
  CONVERSATION_SCRIPT,
  DEFAULT_INSTRUCTIONS,
} from '@/features/playground/conversationScript';
import { LiveTranscript } from '@/features/playground/LiveTranscript';
import { MicOrb } from '@/features/playground/MicOrb';
import { SessionHistory } from '@/features/playground/SessionHistory';
import { SessionSettings } from '@/features/playground/SessionSettings';
import { useMicrophoneLevel } from '@/features/playground/useMicrophoneLevel';
import { formatDuration } from '@/lib/format';
import { findVoice } from '@/mocks/voices';

const TURN_GAP_MS = 2500;
const TYPING_STEP_MS = 35;

function randomLatency() {
  return 120 + Math.round(Math.random() * 60);
}

export function PlaygroundView() {
  const dispatch = useDispatch();
  const orbRef = useRef(null);
  const meterRef = useRef(null);
  const connectTimerRef = useRef(null);
  const startedAtRef = useRef(0);
  const microphone = useMicrophoneLevel(orbRef, meterRef);

  const [phase, setPhase] = useState('idle');
  const [muted, setMuted] = useState(false);
  const [micBlocked, setMicBlocked] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [latency, setLatency] = useState(null);
  const [lines, setLines] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [settings, setSettings] = useState({
    voice: 'coral',
    style: 'Balanced',
    instructions: DEFAULT_INSTRUCTIONS,
    captions: true,
  });

  const isLive = phase === 'listening' || phase === 'speaking';
  const isBusy = isLive || phase === 'connecting';
  const voice = findVoice(settings.voice);

  useEffect(() => () => clearTimeout(connectTimerRef.current), []);

  useEffect(() => {
    if (!isLive) return undefined;

    const clock = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    const latencyClock = setInterval(() => setLatency(randomLatency()), 3000);

    return () => {
      clearInterval(clock);
      clearInterval(latencyClock);
    };
  }, [isLive]);

  useEffect(() => {
    if (!isLive) return undefined;

    const timers = new Set();
    let typingTimer = null;
    const sessionId = startedAtRef.current;
    const secondsSinceStart = () =>
      Math.round((Date.now() - startedAtRef.current) / 1000);

    const later = (callback, delay) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
    };

    const playTurn = (index) => {
      const turn = CONVERSATION_SCRIPT[index];

      if (!turn) return;

      const id = `${sessionId}-${index}`;

      if (turn.speaker === 'user') {
        setLines((current) => [
          ...current,
          { id, ...turn, shown: turn.text.length, at: secondsSinceStart() },
        ]);
        later(() => playTurn(index + 1), TURN_GAP_MS);
        return;
      }

      setPhase('speaking');
      setLines((current) => [
        ...current,
        { id, ...turn, shown: 0, at: secondsSinceStart() },
      ]);

      let shown = 0;

      typingTimer = setInterval(() => {
        shown = Math.min(turn.text.length, shown + 2);
        setLines((current) =>
          current.map((line) => (line.id === id ? { ...line, shown } : line)),
        );

        if (shown >= turn.text.length) {
          clearInterval(typingTimer);
          typingTimer = null;
          setPhase('listening');
          later(() => playTurn(index + 1), TURN_GAP_MS);
        }
      }, TYPING_STEP_MS);
    };

    later(() => playTurn(0), 1500);

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      clearInterval(typingTimer);
    };
  }, [isLive]);

  const beginSession = (demo) => {
    setMicBlocked(false);
    setLines([]);
    setMuted(false);
    setElapsed(0);
    setLatency(null);
    setPhase('connecting');

    clearTimeout(connectTimerRef.current);
    connectTimerRef.current = setTimeout(() => {
      startedAtRef.current = Date.now();
      if (demo) microphone.startDemo();
      setLatency(randomLatency());
      setPhase('listening');
    }, 1000);
  };

  const handleStart = async () => {
    setMicBlocked(false);
    setPhase('connecting');

    const granted = await microphone.startMicrophone();

    if (!granted) {
      setPhase('idle');
      setMicBlocked(true);
      return;
    }

    beginSession(false);
  };

  const handleEnd = () => {
    microphone.stop();

    const duration = Math.max(
      1,
      Math.round((Date.now() - startedAtRef.current) / 1000),
    );
    const credits = Math.max(
      1,
      Math.ceil((duration / 60) * CREDITS_PER_MINUTE.realtime),
    );

    dispatch(
      creditsSpent(credits, {
        description: 'Real-time conversation',
        feature: 'realtime',
      }),
    );
    setSessions((current) => [
      {
        id: `${startedAtRef.current}`,
        endedAt: Date.now(),
        duration,
        turns: lines.length,
        credits,
      },
      ...current,
    ]);
    setLines((current) =>
      current.map((line) => ({ ...line, shown: line.text.length })),
    );
    setElapsed(duration);
    setMuted(false);
    setPhase('ended');
    toast.success('Conversation ended', {
      description: `${formatDuration(duration)} · ${credits} credits used`,
    });
  };

  const toggleMute = () => {
    const next = !muted;

    setMuted(next);
    microphone.setMuted(next);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-4">
        <Panel className="items-center px-4 py-8 text-center sm:py-10">
          <MicOrb
            phase={phase}
            muted={muted}
            orbRef={orbRef}
            meterRef={meterRef}
          />
          <p className="text-[13px] text-muted-foreground">
            Talking to <span className="text-foreground">{voice.name}</span>
            {' · '}
            {settings.style} replies
          </p>
          {micBlocked ? (
            <div className="flex w-full max-w-md flex-col items-center gap-3 text-left">
              <FormAlert>
                Microphone access is blocked. Allow it in your browser to talk
                to the agent.
              </FormAlert>
              <Button variant="outline" onClick={() => beginSession(true)}>
                <Play aria-hidden="true" />
                Continue in demo mode
              </Button>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            {phase === 'connecting' ? (
              <Button size="lg" disabled>
                <Spinner />
                Connecting…
              </Button>
            ) : isLive ? (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleEnd}
                  className="border-danger/50 text-danger hover:bg-danger/10 hover:text-danger"
                >
                  <PhoneOff aria-hidden="true" />
                  End conversation
                </Button>
                <Button
                  size="icon-lg"
                  variant="outline"
                  onClick={toggleMute}
                  aria-pressed={muted}
                  aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
                  title={muted ? 'Unmute' : 'Mute'}
                  className={muted ? 'border-warning/50 text-warning' : ''}
                >
                  {muted ? (
                    <MicOff aria-hidden="true" />
                  ) : (
                    <Mic aria-hidden="true" />
                  )}
                </Button>
              </>
            ) : (
              <Button size="lg" onClick={handleStart}>
                <Mic aria-hidden="true" />
                Start conversation
              </Button>
            )}
          </div>
          <div className="flex flex-col items-center gap-0.5">
            {isLive || phase === 'ended' ? (
              <span
                className="font-mono text-[15px] tabular-nums"
                aria-label="Elapsed time"
              >
                {formatDuration(elapsed)}
              </span>
            ) : null}
            <span className="text-[12px] text-ink-3">
              ≈ {CREDITS_PER_MINUTE.realtime} credits/min
            </span>
          </div>
        </Panel>
        <LiveTranscript
          lines={lines}
          captionsEnabled={settings.captions}
          isLive={isLive}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <SessionSettings
          settings={settings}
          onChange={setSettings}
          disabled={isBusy}
        />
        <ConnectionPanel phase={phase} latency={latency} />
        <SessionHistory sessions={sessions} />
      </div>
    </div>
  );
}
