'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Download,
  FolderOpen,
  History,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { EstimatedCost } from '@/components/audio/EstimatedCost';
import { Button } from '@/components/ui/button';
import { ChoiceChips } from '@/components/ui/ChoiceChips';
import { EmptyState } from '@/components/ui/EmptyState';
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
import { Skeleton } from '@/components/ui/skeleton';
import { SliderField } from '@/components/ui/SliderField';
import { Spinner } from '@/components/ui/Spinner';
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateSpeechMutation,
  useGetRecentSpeechFilesQuery,
  useGetSpeechDefaultsQuery,
  useGetSpeechDownloadUrlMutation,
  useGetSpeechOptionsQuery,
} from '@/features/text-to-speech/speechApi';
import {
  DEFAULT_SCRIPT,
  TITLE_MAX_LENGTH,
  WARNING_RATIO,
  describeUnit,
  estimateSpeechCredits,
  formatLabel,
  styleLabel,
} from '@/features/text-to-speech/ttsOptions';
import { VoiceGrid } from '@/features/text-to-speech/VoiceGrid';
import { getErrorMessage } from '@/lib/apiError';
import { formatDateTime, formatDuration } from '@/lib/format';
import { cn } from '@/lib/utils';

const RECENT_LIMIT = 5;
const DIRECTION_MAX_LENGTH = 300;
const PAYMENT_REQUIRED = 402;

function CharacterCounter({ count, limit }) {
  return (
    <span
      className={cn(
        'shrink-0 font-mono text-[12px]',
        count > limit
          ? 'text-danger'
          : count > limit * WARNING_RATIO
            ? 'text-warning'
            : 'text-ink-3',
      )}
    >
      {count.toLocaleString()} / {limit.toLocaleString()}
    </span>
  );
}

function TakeMeta({ take, voiceName }) {
  return (
    <p className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11.5px] text-ink-3">
      <span>{voiceName}</span>
      {take.style ? <span>{styleLabel(take.style)}</span> : null}
      {take.speed ? <span>{take.speed.toFixed(2)}x</span> : null}
      <span>{formatLabel(take.format)}</span>
      <span>{formatDuration(take.durationSeconds ?? 0)}</span>
    </p>
  );
}

function GenerateError({ error }) {
  if (!error) return null;

  return (
    <FormAlert>
      {getErrorMessage(error)}
      {error.status === PAYMENT_REQUIRED ? (
        <>
          {' '}
          <Link href="/app/credits" className="font-semibold underline">
            View credits
          </Link>
        </>
      ) : null}
    </FormAlert>
  );
}

function StudioSkeleton() {
  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-85 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
      <Skeleton className="h-120 rounded-2xl" />
    </div>
  );
}

function RecentTakes({ files, isLoading, voiceNameFor }) {
  return (
    <Panel title="Recent takes" description="Your last 5 generated files">
      {isLoading ? (
        <Skeleton className="h-24 rounded-xl" />
      ) : files.length ? (
        <ul className="flex flex-col gap-3">
          {files.map((file) => (
            <li key={file.id} className="flex flex-col gap-1.5">
              <p className="truncate text-[12.5px] font-medium">{file.title}</p>
              <AudioPlayer
                id={`tts-recent-${file.id}`}
                label={file.title}
                src={file.url}
                duration={file.durationSeconds ?? 0}
                bars={32}
                className="py-2"
              />
              <p className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11.5px] text-ink-3">
                <span>{voiceNameFor(file.voiceCode)}</span>
                <span>{formatLabel(file.format)}</span>
                <span>{formatDateTime(file.createdAt)}</span>
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={History}
          title="No takes yet"
          description="Generated audio shows up here."
          className="py-6"
        />
      )}
    </Panel>
  );
}

function StudioError({ error, onRetry }) {
  return (
    <Panel>
      <EmptyState
        icon={Sparkles}
        title="Text to speech is not available"
        description={getErrorMessage(error)}
        action={
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        }
      />
    </Panel>
  );
}

export function TextToSpeechView() {
  const optionsQuery = useGetSpeechOptionsQuery();
  const defaultsQuery = useGetSpeechDefaultsQuery();
  const recentQuery = useGetRecentSpeechFilesQuery(RECENT_LIMIT);
  const [createSpeech, { isLoading: isGenerating, error: generateError }] =
    useCreateSpeechMutation();
  const [getDownloadUrl, { isLoading: isPreparingDownload }] =
    useGetSpeechDownloadUrlMutation();

  const [script, setScript] = useState(DEFAULT_SCRIPT);
  const [title, setTitle] = useState('');
  const [chosenFormat, setChosenFormat] = useState(null);
  const [chosenVoice, setChosenVoice] = useState(null);
  const [chosenModel, setChosenModel] = useState(null);
  const [speed, setSpeed] = useState(1);
  const [style, setStyle] = useState(null);
  const [direction, setDirection] = useState('');
  const [latest, setLatest] = useState(null);

  if (optionsQuery.isLoading || defaultsQuery.isLoading) {
    return <StudioSkeleton />;
  }

  if (optionsQuery.error || !optionsQuery.data) {
    return (
      <StudioError error={optionsQuery.error} onRetry={optionsQuery.refetch} />
    );
  }

  const options = optionsQuery.data;
  const settings = defaultsQuery.data;
  const voices = options.voices;
  const models = options.models;
  const voiceCodes = voices.map((voice) => voice.code);
  const voiceCode =
    chosenVoice ??
    (voiceCodes.includes(settings?.defaultVoiceCode)
      ? settings.defaultVoiceCode
      : voiceCodes[0]);
  const format =
    chosenFormat ??
    (options.formats.includes(settings?.defaultFormat)
      ? settings.defaultFormat
      : options.formats[0]);
  const model =
    models.find((item) => item.id === chosenModel) ??
    models.find((item) => item.isDefault) ??
    models[0];
  const currentStyle = style ?? options.styles[0];
  const maxCharacters = options.maxCharacters;
  const characterCount = script.trim().length;
  const isOverLimit = characterCount > maxCharacters;
  const cost = model ? estimateSpeechCredits(characterCount, model) : 0;
  const canGenerate =
    characterCount > 0 &&
    !isOverLimit &&
    !isGenerating &&
    Boolean(model) &&
    Boolean(voiceCode);
  const recentFiles = recentQuery.data ?? [];

  function voiceNameFor(code) {
    return voices.find((voice) => voice.code === code)?.name ?? code ?? '—';
  }

  async function generate() {
    if (!canGenerate) return;

    const body = {
      text: script,
      voiceCode,
      modelId: model.id,
      format,
      style: currentStyle,
      speed,
    };

    if (direction.trim()) body.direction = direction.trim();
    if (title.trim()) body.title = title.trim();

    try {
      const result = await createSpeech(body).unwrap();

      setLatest({ ...result.audioFile, style: currentStyle, speed });
      toast.success('Audio generated', {
        description: `${result.generation.creditsCharged.toLocaleString()} credits used`,
      });
    } catch {
      return;
    }
  }

  async function download() {
    if (!latest) return;

    try {
      const url = await getDownloadUrl(latest.id).unwrap();
      const link = document.createElement('a');

      link.href = url;
      link.rel = 'noopener';
      document.body.append(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-4">
        <Panel
          title="Script"
          action={
            <CharacterCounter count={characterCount} limit={maxCharacters} />
          }
        >
          <label htmlFor="tts-script" className="sr-only">
            Script
          </label>
          <Textarea
            id="tts-script"
            value={script}
            onChange={(event) => setScript(event.target.value)}
            placeholder="Type or paste the text you want to hear..."
            aria-invalid={isOverLimit}
            aria-describedby="tts-script-limit"
            className="min-h-55 resize-y text-[14px] leading-relaxed"
          />
          <p
            id="tts-script-limit"
            className={cn(
              'text-[12px]',
              isOverLimit ? 'text-danger' : 'text-ink-3',
            )}
          >
            {isOverLimit
              ? `Scripts are limited to ${maxCharacters.toLocaleString()} characters. Shorten it to generate.`
              : `Up to ${maxCharacters.toLocaleString()} characters per take. The voice follows the language of your script.`}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              id="tts-title"
              label="Title"
              aside={<span className="text-[11.5px] text-ink-3">Optional</span>}
            >
              <Input
                id="tts-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={TITLE_MAX_LENGTH}
                placeholder="Named after your script if empty"
              />
            </Field>
            <Field id="tts-format" label="Output format">
              <Select value={format} onValueChange={setChosenFormat}>
                <SelectTrigger id="tts-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.formats.map((option) => (
                    <SelectItem key={option} value={option}>
                      {formatLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Panel>

        <Panel title="Voice">
          {voices.length ? (
            <VoiceGrid
              voices={voices}
              value={voiceCode}
              onChange={setChosenVoice}
            />
          ) : (
            <EmptyState
              icon={Sparkles}
              title="No voices available"
              description="An admin needs to enable at least one voice."
            />
          )}
        </Panel>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <Panel title="Settings">
          <Field id="tts-model" label="Model">
            <Select
              value={model?.id ?? ''}
              onValueChange={setChosenModel}
              disabled={!models.length}
            >
              <SelectTrigger id="tts-model">
                <SelectValue placeholder="No models available" />
              </SelectTrigger>
              <SelectContent>
                {models.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <SliderField
            id="tts-speed"
            label="Speaking speed"
            value={speed}
            onChange={setSpeed}
            min={options.speeds.min}
            max={options.speeds.max}
            step={0.05}
            format={(current) => `${current.toFixed(2)}x`}
          />

          <div className="flex flex-col gap-2">
            <span className="text-[12.5px] text-muted-foreground">
              Style & emotion
            </span>
            <ChoiceChips
              label="Style & emotion"
              options={options.styles.map((option) => ({
                value: option,
                label: styleLabel(option),
              }))}
              value={currentStyle}
              onChange={setStyle}
            />
          </div>

          <Field
            id="tts-direction"
            label="Extra direction"
            aside={<span className="text-[11.5px] text-ink-3">Optional</span>}
          >
            <Textarea
              id="tts-direction"
              value={direction}
              onChange={(event) => setDirection(event.target.value)}
              maxLength={DIRECTION_MAX_LENGTH}
              placeholder="e.g. Speak like a friendly radio host"
              className="min-h-16 resize-none"
            />
          </Field>
        </Panel>

        <div className="flex flex-col gap-1.5">
          <EstimatedCost credits={cost} />
          {model ? (
            <p className="px-1 text-[11.5px] text-ink-3">
              {describeUnit(model)}
            </p>
          ) : null}
        </div>
        <GenerateError error={generateError} />

        <Button
          size="lg"
          className="w-full"
          onClick={generate}
          disabled={!canGenerate}
        >
          {isGenerating ? (
            <>
              <Spinner />
              Generating...
            </>
          ) : (
            <>
              <Sparkles />
              Generate audio
            </>
          )}
        </Button>

        {latest ? (
          <Panel title="Latest take" description={latest.title}>
            <AudioPlayer
              id={`tts-take-${latest.id}`}
              label="latest take"
              src={latest.url}
              duration={latest.durationSeconds ?? 0}
              bars={32}
            />
            <TakeMeta
              take={latest}
              voiceName={voiceNameFor(latest.voiceCode)}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={download}
                disabled={isPreparingDownload}
              >
                {isPreparingDownload ? <Spinner /> : <Download />}
                Download
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/library">
                  <FolderOpen />
                  Open in library
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={generate}
                disabled={!canGenerate}
              >
                <RotateCcw />
                Regenerate
              </Button>
            </div>
          </Panel>
        ) : null}

        <RecentTakes
          files={recentFiles}
          isLoading={recentQuery.isLoading}
          voiceNameFor={voiceNameFor}
        />
      </div>
    </div>
  );
}
