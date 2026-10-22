'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';
import { AudioDropzone } from '@/components/audio/AudioDropzone';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { EstimatedCost } from '@/components/audio/EstimatedCost';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import { Panel } from '@/components/ui/Panel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Switch } from '@/components/ui/switch';
import { ToggleRow } from '@/components/ui/ToggleRow';
import { TranscriptPanel } from '@/features/speech-to-text/TranscriptPanel';
import {
  INITIAL_SPEAKERS,
  MOCK_AUDIO_SECONDS,
  MOCK_SEGMENTS,
} from '@/features/speech-to-text/transcriptMock';
import { LANGUAGES } from '@/constants/languages';
import { CREDITS_PER_MINUTE, perMinuteCredits } from '@/constants/pricing';
import { useCreditCharge } from '@/hooks/useCreditCharge';
import { formatDuration } from '@/lib/format';

const MAX_BYTES = 25 * 1024 * 1024;
const UPLOAD_DELAY_MS = 900;
const TRANSCRIBE_DELAY_MS = 1300;
const AUTO_DETECT = 'auto';

const STATUS_LABELS = {
  uploading: 'Uploading...',
  transcribing: 'Transcribing...',
};

function DetectionRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export function SpeechToTextView() {
  const { canAfford, charge, shortfallMessage } = useCreditCharge();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');
  const [language, setLanguage] = useState(AUTO_DETECT);
  const [keyTerms, setKeyTerms] = useState('');
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showSpeakers, setShowSpeakers] = useState(true);
  const [segments, setSegments] = useState(MOCK_SEGMENTS);
  const [speakers, setSpeakers] = useState(INITIAL_SPEAKERS);

  const file = files[0];
  const isDone = status === 'done';
  const isWorking = status === 'uploading' || status === 'transcribing';
  const cost = file
    ? perMinuteCredits(MOCK_AUDIO_SECONDS, CREDITS_PER_MINUTE.speechToText)
    : 0;
  const detectedLanguage =
    language === AUTO_DETECT ? 'English (detected)' : language;

  function changeFiles(nextFiles) {
    setFiles(nextFiles);
    setError('');
    setStatus('idle');
    setSegments(MOCK_SEGMENTS);
    setSpeakers(INITIAL_SPEAKERS);
  }

  function transcribe() {
    if (!file || isWorking) return;

    if (!canAfford(cost)) {
      setError(shortfallMessage(cost));
      return;
    }

    setError('');
    setStatus('uploading');

    window.setTimeout(() => {
      setStatus('transcribing');

      window.setTimeout(() => {
        charge(cost, {
          description: `Transcription · ${file.name}`,
          feature: 'speechToText',
        });
        setStatus('done');
        toast.success('Transcript ready', {
          description: `${cost.toLocaleString()} credits used`,
        });
      }, TRANSCRIBE_DELAY_MS);
    }, UPLOAD_DELAY_MS);
  }

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-4">
        <Panel title="Audio">
          <AudioDropzone
            files={files}
            onFilesChange={changeFiles}
            onError={setError}
            hint="MP3, WAV or M4A up to 25MB"
            maxBytes={MAX_BYTES}
          />
          {file ? (
            <AudioPlayer
              id={`stt-source-${file.name}`}
              label={file.name}
              duration={MOCK_AUDIO_SECONDS}
            />
          ) : null}
        </Panel>

        {isDone ? (
          <TranscriptPanel
            segments={segments}
            onSegmentChange={(id, text) =>
              setSegments((current) =>
                current.map((segment) =>
                  segment.id === id ? { ...segment, text } : segment,
                ),
              )
            }
            speakers={speakers}
            onSpeakerRename={(speaker, name) =>
              setSpeakers((current) => ({ ...current, [speaker]: name }))
            }
            showSpeakers={showSpeakers}
            showTimestamps={showTimestamps}
          />
        ) : (
          <Panel title="Transcript">
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <span className="flex size-10 items-center justify-center rounded-xl border bg-field text-ink-3">
                {isWorking ? (
                  <Spinner className="size-5" />
                ) : (
                  <FileText className="size-5" aria-hidden="true" />
                )}
              </span>
              <p className="text-[13.5px] font-semibold" aria-live="polite">
                {isWorking ? STATUS_LABELS[status] : 'No transcript yet'}
              </p>
              <p className="max-w-sm text-[12.5px] text-ink-3">
                {file
                  ? 'Your transcript with speakers and timestamps appears here.'
                  : 'Upload an audio file, then transcribe it to see the text here.'}
              </p>
            </div>
          </Panel>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <Panel title="Detection">
          <DetectionRow label="Language">
            <span className="font-medium">
              {isDone ? detectedLanguage : '—'}
            </span>
          </DetectionRow>
          <DetectionRow label="Duration">
            <span className="font-mono text-[12.5px]">
              {isDone ? formatDuration(MOCK_AUDIO_SECONDS) : '—'}
            </span>
          </DetectionRow>
          <DetectionRow label="Speaker labels">
            <span className="flex items-center gap-2.5">
              <StatusBadge tone={showSpeakers ? 'success' : 'neutral'}>
                {showSpeakers ? 'Enabled' : 'Off'}
              </StatusBadge>
              <Switch
                checked={showSpeakers}
                onCheckedChange={setShowSpeakers}
                aria-label="Speaker labels"
              />
            </span>
          </DetectionRow>
        </Panel>

        <Panel title="Options">
          <Field id="stt-language" label="Language">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="stt-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AUTO_DETECT}>Auto-detect</SelectItem>
                {LANGUAGES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field
            id="stt-key-terms"
            label="Key terms"
            hint="Helps spell names and jargon"
          >
            <Input
              id="stt-key-terms"
              value={keyTerms}
              onChange={(event) => setKeyTerms(event.target.value)}
              placeholder="e.g. Fraunces, onboarding, LUFS"
              aria-describedby="stt-key-terms-hint"
            />
          </Field>
          <ToggleRow
            id="stt-timestamps"
            label="Timestamps"
            description="Show when each segment starts"
            checked={showTimestamps}
            onChange={setShowTimestamps}
          />
        </Panel>

        <EstimatedCost credits={cost} />
        <FormAlert>{error}</FormAlert>

        <Button
          size="lg"
          className="w-full"
          onClick={transcribe}
          disabled={!file || isWorking}
        >
          {isWorking ? (
            <>
              <Spinner />
              {STATUS_LABELS[status]}
            </>
          ) : (
            <>
              <FileText />
              {isDone ? 'Transcribe again' : 'Transcribe audio'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
