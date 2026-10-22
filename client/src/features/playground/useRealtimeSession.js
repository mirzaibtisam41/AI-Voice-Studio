'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/apiError';
import { formatDuration } from '@/lib/format';
import {
  connectRealtime,
  readRoundTripMs,
} from '@/features/playground/realtimeConnection';
import {
  useCancelRealtimeSessionMutation,
  useEndRealtimeSessionMutation,
  useStartRealtimeSessionMutation,
} from '@/features/playground/realtimeApi';
import { useMicrophoneLevel } from '@/features/playground/useMicrophoneLevel';

const TRANSCRIPT_LINES_MAX = 500;
const TRANSCRIPT_LINE_MAX_LENGTH = 4000;
const STATS_INTERVAL_MS = 3000;

export const CONNECT_FAILED_MESSAGE =
  "Couldn't connect to the voice service. Your credits were refunded.";

function toTranscript(lines) {
  return lines
    .filter((line) => line.text.trim())
    .slice(0, TRANSCRIPT_LINES_MAX)
    .map((line) => ({
      role: line.speaker === 'agent' ? 'assistant' : 'user',
      text: line.text.trim().slice(0, TRANSCRIPT_LINE_MAX_LENGTH),
      at: Math.max(0, line.at),
    }));
}

export function useRealtimeSession() {
  const orbRef = useRef(null);
  const meterRef = useRef(null);
  const audioRef = useRef(null);
  const connectionRef = useRef(null);
  const sessionRef = useRef(null);
  const startedAtRef = useRef(0);
  const linesRef = useRef([]);
  const endingRef = useRef(false);
  const sawAudioBufferRef = useRef(false);
  const mountedRef = useRef(true);
  const microphone = useMicrophoneLevel(orbRef, meterRef);

  const [startSession] = useStartRealtimeSessionMutation();
  const [endSession] = useEndRealtimeSessionMutation();
  const [cancelSession] = useCancelRealtimeSessionMutation();

  const [phase, setPhase] = useState('idle');
  const [muted, setMuted] = useState(false);
  const [micBlocked, setMicBlocked] = useState(false);
  const [lines, setLinesState] = useState([]);
  const [session, setSession] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [roundTripMs, setRoundTripMs] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [result, setResult] = useState(null);

  const isLive = phase === 'listening' || phase === 'speaking';

  const setLines = useCallback((update) => {
    linesRef.current = update(linesRef.current);
    setLinesState(linesRef.current);
  }, []);

  const secondsSinceStart = useCallback(
    () => Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000)),
    [],
  );

  const upsertLine = useCallback(
    (id, speaker, change) => {
      setLines((current) => {
        const exists = current.some((line) => line.id === id);
        const base = exists
          ? current
          : [
              ...current,
              { id, speaker, text: '', pending: true, at: secondsSinceStart() },
            ];

        return base.map((line) =>
          line.id === id ? { ...line, ...change(line) } : line,
        );
      });
    },
    [secondsSinceStart, setLines],
  );

  const handleEvent = useCallback(
    (event) => {
      switch (event.type) {
        case 'input_audio_buffer.committed':
          upsertLine(event.item_id, 'user', () => ({}));
          break;
        case 'conversation.item.input_audio_transcription.delta':
          upsertLine(event.item_id, 'user', (line) => ({
            text: line.text + (event.delta ?? ''),
          }));
          break;
        case 'conversation.item.input_audio_transcription.completed':
          upsertLine(event.item_id, 'user', () => ({
            text: event.transcript ?? '',
            pending: false,
          }));
          break;
        case 'conversation.item.input_audio_transcription.failed':
          upsertLine(event.item_id, 'user', () => ({ pending: false }));
          break;
        case 'response.output_audio_transcript.delta':
          setPhase('speaking');
          upsertLine(event.item_id, 'agent', (line) => ({
            text: line.text + (event.delta ?? ''),
          }));
          break;
        case 'response.output_audio_transcript.done':
          upsertLine(event.item_id, 'agent', () => ({
            text: event.transcript ?? '',
            pending: false,
          }));
          break;
        case 'output_audio_buffer.started':
          sawAudioBufferRef.current = true;
          setPhase('speaking');
          break;
        case 'output_audio_buffer.stopped':
        case 'output_audio_buffer.cleared':
          setPhase('listening');
          break;
        case 'response.done':
          if (!sawAudioBufferRef.current) setPhase('listening');
          break;
        case 'error':
          toast.error(
            event.error?.message ?? 'The voice service sent an error',
          );
          break;
        default:
          break;
      }
    },
    [upsertLine],
  );

  const end = useCallback(async () => {
    const current = sessionRef.current;

    if (!current || endingRef.current) return;

    endingRef.current = true;
    setPhase('ending');
    connectionRef.current?.close();
    connectionRef.current = null;
    microphone.stop();
    setMuted(false);
    setLines((existing) =>
      existing
        .filter((line) => line.text.trim())
        .map((line) => ({ ...line, pending: false })),
    );

    try {
      const data = await endSession({
        id: current.sessionId,
        transcript: toTranscript(linesRef.current),
      }).unwrap();
      const duration = data.session.durationSeconds ?? 0;

      if (!mountedRef.current) return;

      setResult(data);
      setElapsed(duration);
      toast.success('Conversation ended', {
        description: `${formatDuration(duration)} · ${data.creditsCharged} credits used`,
      });
    } catch (endError) {
      if (mountedRef.current) setError({ message: getErrorMessage(endError) });
    } finally {
      sessionRef.current = null;
      if (mountedRef.current) setPhase('ended');
    }
  }, [endSession, microphone, setLines]);

  const start = useCallback(
    async (body) => {
      if (sessionRef.current) return;

      setError(null);
      setNotice(null);
      setResult(null);
      setMicBlocked(false);
      setMuted(false);
      setElapsed(0);
      setRoundTripMs(null);
      setLines(() => []);
      setPhase('connecting');
      endingRef.current = false;
      sawAudioBufferRef.current = false;

      const stream = await microphone.startMicrophone();

      if (!stream) {
        setPhase('idle');
        setMicBlocked(true);
        return;
      }

      let created;

      try {
        created = await startSession(body).unwrap();
      } catch (startError) {
        microphone.stop();
        setPhase('idle');
        setError({
          message: getErrorMessage(startError),
          needsCredits: startError?.status === 402,
        });
        return;
      }

      sessionRef.current = created;
      startedAtRef.current = Date.now();
      setSession(created);

      try {
        connectionRef.current = await connectRealtime({
          clientSecret: created.clientSecret,
          stream,
          audioElement: audioRef.current,
          onEvent: handleEvent,
          onDisconnect: () => {
            toast.error('The voice connection dropped');
            end();
          },
        });
      } catch {
        microphone.stop();
        sessionRef.current = null;

        try {
          await cancelSession(created.sessionId).unwrap();
          setNotice(CONNECT_FAILED_MESSAGE);
        } catch (cancelError) {
          setError({
            message: `Couldn't connect to the voice service. ${getErrorMessage(cancelError)}`,
          });
        }

        setPhase('idle');
        return;
      }

      if (!mountedRef.current) {
        connectionRef.current.close();
        return;
      }

      setRemaining(created.allowedMinutes * 60 - secondsSinceStart());
      setPhase('listening');
    },
    [
      cancelSession,
      end,
      handleEvent,
      microphone,
      secondsSinceStart,
      setLines,
      startSession,
    ],
  );

  const toggleMute = useCallback(() => {
    const next = !muted;

    microphone.setMuted(next);
    setMuted(next);
  }, [microphone, muted]);

  useEffect(() => {
    if (!isLive) return undefined;

    const allowedSeconds = (sessionRef.current?.allowedMinutes ?? 0) * 60;
    const clock = setInterval(() => {
      const seconds = secondsSinceStart();
      const left = Math.max(0, allowedSeconds - seconds);

      setElapsed(seconds);
      setRemaining(left);

      if (left === 0) {
        toast.info('You reached the time limit for this conversation');
        end();
      }
    }, 1000);
    const stats = setInterval(async () => {
      const peer = connectionRef.current?.peer;

      if (!peer) return;

      try {
        setRoundTripMs(await readRoundTripMs(peer));
      } catch {
        setRoundTripMs(null);
      }
    }, STATS_INTERVAL_MS);

    return () => {
      clearInterval(clock);
      clearInterval(stats);
    };
  }, [end, isLive, secondsSinceStart]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      const current = sessionRef.current;

      connectionRef.current?.close();
      connectionRef.current = null;

      if (current && !endingRef.current) {
        endingRef.current = true;
        endSession({
          id: current.sessionId,
          transcript: toTranscript(linesRef.current),
        });
      }
    };
  }, [endSession]);

  return {
    orbRef,
    meterRef,
    audioRef,
    phase,
    isLive,
    muted,
    micBlocked,
    lines,
    session,
    remaining,
    elapsed,
    roundTripMs,
    error,
    notice,
    result,
    start,
    end,
    toggleMute,
  };
}
