'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mic, MicOff, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { getErrorMessage } from '@/lib/apiError';
import { formatDuration } from '@/lib/format';
import { useGetAgentQuery } from '@/features/agents/agentsApi';
import { ConnectionPanel } from '@/features/playground/ConnectionPanel';
import { LiveTranscript } from '@/features/playground/LiveTranscript';
import { MicOrb } from '@/features/playground/MicOrb';
import { useGetRealtimeOptionsQuery } from '@/features/playground/realtimeApi';
import { SessionHistory } from '@/features/playground/SessionHistory';
import { SessionSettings } from '@/features/playground/SessionSettings';
import { useRealtimeSession } from '@/features/playground/useRealtimeSession';

function SessionSummary({ result }) {
  if (!result) return null;

  return (
    <FormAlert tone="success">
      Conversation ended after{' '}
      {formatDuration(result.session.durationSeconds ?? 0)}.{' '}
      {result.creditsCharged} credits charged
      {result.creditsRefunded > 0
        ? `, ${result.creditsRefunded} unused credits refunded`
        : ''}
      . Balance: {result.balance} credits.
    </FormAlert>
  );
}

export function PlaygroundView() {
  const searchParams = useSearchParams();
  const agentId = searchParams.get('agentId');
  const optionsQuery = useGetRealtimeOptionsQuery();
  const agentQuery = useGetAgentQuery(agentId, { skip: !agentId });
  const options = optionsQuery.data;
  const agent = agentId ? agentQuery.data : null;

  const [settings, setSettings] = useState({
    voiceCode: null,
    responseStyle: 'balanced',
    instructions: '',
    captions: true,
  });

  const {
    orbRef,
    meterRef,
    audioRef,
    start,
    end,
    toggleMute,
    phase,
    isLive,
    muted,
    micBlocked,
    lines,
    session,
    remaining,
    roundTripMs,
    error,
    notice,
    result,
  } = useRealtimeSession();
  const isBusy = isLive || phase === 'connecting' || phase === 'ending';
  const voiceCode = settings.voiceCode ?? options?.voices[0]?.code ?? null;
  const activeVoiceCode = agent ? agent.voiceCode : voiceCode;
  const voiceName =
    options?.voices.find((voice) => voice.code === activeVoiceCode)?.name ??
    activeVoiceCode;
  const rate = agentId ? options?.rates.voiceAgent : options?.rates.realtime;
  const defaultModel = (agentId ? options?.agentModels : options?.models)?.find(
    (model) => model.isDefault,
  );
  const agentMissing = Boolean(agentId) && agentQuery.isError;
  const canStart =
    Boolean(options) &&
    (agentId ? Boolean(agent) : Boolean(voiceCode)) &&
    !agentMissing;

  const handleStart = () => {
    if (agentId) {
      start({ agentId });
      return;
    }

    const instructions = settings.instructions.trim();

    start({
      voiceCode,
      responseStyle: settings.responseStyle,
      ...(instructions ? { instructions } : {}),
    });
  };

  const styleLabel = agent ? agent.responseStyle : settings.responseStyle;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-4">
        <Panel className="items-center px-4 py-8 text-center sm:py-10">
          <audio ref={audioRef} autoPlay className="hidden" />
          <MicOrb
            phase={phase}
            muted={muted}
            orbRef={orbRef}
            meterRef={meterRef}
          />
          <p className="text-[13px] text-muted-foreground">
            {agent ? (
              <>
                Talking to <span className="text-foreground">{agent.name}</span>
                {' · '}
                {voiceName} voice
              </>
            ) : (
              <>
                Talking to{' '}
                <span className="text-foreground">{voiceName ?? '…'}</span>
                {' · '}
                {styleLabel} replies
              </>
            )}
          </p>
          <div className="flex w-full max-w-md flex-col gap-3 text-left empty:hidden">
            {micBlocked ? (
              <FormAlert>
                Microphone access is blocked. Allow it in your browser to talk
                to the agent. No credits were used.
              </FormAlert>
            ) : null}
            {notice ? <FormAlert>{notice}</FormAlert> : null}
            {error ? (
              <FormAlert>
                {error.message}
                {error.needsCredits ? (
                  <>
                    {' '}
                    <Link href="/app/credits" className="underline">
                      View credits
                    </Link>
                  </>
                ) : null}
              </FormAlert>
            ) : null}
            {agentMissing ? (
              <FormAlert>{getErrorMessage(agentQuery.error)}</FormAlert>
            ) : null}
            {optionsQuery.isError ? (
              <FormAlert>{getErrorMessage(optionsQuery.error)}</FormAlert>
            ) : null}
            {phase === 'ended' ? <SessionSummary result={result} /> : null}
          </div>
          <div className="flex items-center gap-2">
            {phase === 'connecting' || phase === 'ending' ? (
              <Button size="lg" disabled>
                <Spinner />
                {phase === 'connecting' ? 'Connecting…' : 'Ending…'}
              </Button>
            ) : isLive ? (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={end}
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
              <Button size="lg" onClick={handleStart} disabled={!canStart}>
                <Mic aria-hidden="true" />
                Start conversation
              </Button>
            )}
          </div>
          <div className="flex flex-col items-center gap-0.5">
            {isLive && remaining !== null ? (
              <span
                className="font-mono text-[15px] tabular-nums"
                aria-label="Time left"
              >
                {formatDuration(remaining)} left
              </span>
            ) : null}
            {rate ? (
              <span className="text-[12px] text-ink-3">
                {rate} credits/min
                {isLive && session
                  ? ` · up to ${session.allowedMinutes} min this call`
                  : options
                    ? ` · up to ${options.maxMinutes} min per call`
                    : ''}
              </span>
            ) : null}
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
          options={options}
          agent={agent}
          settings={{ ...settings, voiceCode }}
          onChange={setSettings}
          disabled={isBusy}
        />
        <ConnectionPanel
          phase={phase}
          model={session?.model ?? defaultModel?.providerModelId}
          roundTripMs={roundTripMs}
        />
        <SessionHistory agentId={agentId} />
      </div>
    </div>
  );
}
