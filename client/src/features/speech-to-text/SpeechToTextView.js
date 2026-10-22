'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { FileAudio, FileText, X } from 'lucide-react';
import { AudioDropzone } from '@/components/audio/AudioDropzone';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { EstimatedCost } from '@/components/audio/EstimatedCost';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/ChoiceChips';
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
import { Spinner } from '@/components/ui/Spinner';
import {
  AUTO_LANGUAGE,
  UPLOAD_ACCEPT,
  estimateTranscriptionCredits,
  languageName,
  megabytesToBytes,
  parseKeywords,
} from '@/features/speech-to-text/sttOptions';
import {
  useCreateSttTranscriptMutation,
  useGetSttTranscriptQuery,
  useGetTranscriptionOptionsQuery,
  useListSttUploadsQuery,
  useUploadSttAudioMutation,
} from '@/features/speech-to-text/transcriptionsApi';
import { TranscriptHistory } from '@/features/speech-to-text/TranscriptHistory';
import { TranscriptPanel } from '@/features/speech-to-text/TranscriptPanel';
import { getErrorMessage } from '@/lib/apiError';
import { formatBytes, formatDuration } from '@/lib/format';

const UPLOADS_LIMIT = 20;
const PAYMENT_REQUIRED = 402;

function DetectionRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function RequestError({ error }) {
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

function SelectedAudio({ audioFile, onClear, disabled }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 rounded-xl border bg-field px-3 py-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
          <FileAudio className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium">
            {audioFile.title}
          </span>
          <span className="block font-mono text-[11.5px] text-ink-3">
            {String(audioFile.format).toUpperCase()} ·{' '}
            {formatBytes(audioFile.sizeBytes)} ·{' '}
            {formatDuration(audioFile.durationSeconds ?? 0)}
          </span>
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${audioFile.title}`}
          onClick={onClear}
          disabled={disabled}
        >
          <X />
        </Button>
      </div>
      <AudioPlayer
        id={`stt-source-${audioFile.id}`}
        label={audioFile.title}
        src={audioFile.url}
        duration={audioFile.durationSeconds ?? 0}
      />
    </div>
  );
}

function EmptyTranscript({ isWorking, hasAudio }) {
  return (
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
          {isWorking ? 'Transcribing...' : 'No transcript yet'}
        </p>
        <p className="max-w-sm text-[12.5px] text-ink-3">
          {hasAudio
            ? 'Your transcript appears here as editable text.'
            : 'Upload an audio file, then transcribe it to see the text here.'}
        </p>
      </div>
    </Panel>
  );
}

function LanguagePicker({ languages, maxLanguages, value, onChange }) {
  const choices = languages.filter(
    (language) =>
      language.code !== AUTO_LANGUAGE && !value.includes(language.code),
  );
  const isFull = value.length >= maxLanguages;

  return (
    <Field
      id="stt-language"
      label="Language"
      hint={
        value.length
          ? `Up to ${maxLanguages} languages`
          : 'Auto-detect, or pick up to 3 languages spoken in the audio'
      }
    >
      <Select
        value=""
        onValueChange={(code) => onChange([...value, code])}
        disabled={isFull}
      >
        <SelectTrigger id="stt-language" aria-describedby="stt-language-hint">
          <SelectValue
            placeholder={
              value.length
                ? isFull
                  ? `${maxLanguages} languages chosen`
                  : 'Add another language'
                : languageName(languages, AUTO_LANGUAGE)
            }
          />
        </SelectTrigger>
        <SelectContent>
          {choices.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              {language.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value.length ? (
        <div className="flex flex-wrap gap-2">
          {value.map((code) => (
            <Chip
              key={code}
              selected
              aria-label={`Remove ${languageName(languages, code)}`}
              onClick={() => onChange(value.filter((item) => item !== code))}
            >
              {languageName(languages, code)}
              <X className="size-3" aria-hidden="true" />
            </Chip>
          ))}
        </div>
      ) : null}
    </Field>
  );
}

function StudioSkeleton() {
  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-60 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <Skeleton className="h-120 rounded-2xl" />
    </div>
  );
}

export function SpeechToTextView() {
  const optionsQuery = useGetTranscriptionOptionsQuery();
  const uploadsQuery = useListSttUploadsQuery(UPLOADS_LIMIT);
  const [uploadAudio, { isLoading: isUploading }] = useUploadSttAudioMutation();
  const [
    createTranscript,
    { isLoading: isTranscribing, error: transcribeError, reset },
  ] = useCreateSttTranscriptMutation();

  const [localFiles, setLocalFiles] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [languages, setLanguages] = useState([]);
  const [keyTerms, setKeyTerms] = useState('');
  const [chosenModel, setChosenModel] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const transcriptQuery = useGetSttTranscriptQuery(activeId, {
    skip: !activeId,
  });

  if (optionsQuery.isLoading) return <StudioSkeleton />;

  if (optionsQuery.error || !optionsQuery.data) {
    return (
      <Panel>
        <EmptyState
          icon={FileText}
          title="Speech to text is not available"
          description={getErrorMessage(optionsQuery.error)}
          action={
            <Button variant="outline" onClick={optionsQuery.refetch}>
              Try again
            </Button>
          }
        />
      </Panel>
    );
  }

  const options = optionsQuery.data;
  const models = options.models;
  const model =
    models.find((item) => item.id === chosenModel) ??
    models.find((item) => item.isDefault) ??
    models[0];
  const keywords = parseKeywords(keyTerms);
  const keywordError =
    keywords.length > options.maxKeywords
      ? `Use up to ${options.maxKeywords} key terms.`
      : keywords.some((keyword) => keyword.length > options.keywordMaxLength)
        ? `Keep each key term under ${options.keywordMaxLength} characters.`
        : keywords.some((keyword) => /[<>]/.test(keyword))
          ? 'Key terms cannot contain < or >.'
          : '';
  const uploads = uploadsQuery.data ?? [];
  const cost = estimateTranscriptionCredits(audioFile?.durationSeconds, model);
  const isWorking = isUploading || isTranscribing;
  const canTranscribe =
    Boolean(audioFile) && Boolean(model) && !isWorking && !keywordError;
  const transcription = activeId ? transcriptQuery.data : null;

  async function changeFiles(nextFiles) {
    setUploadError('');
    setLocalFiles(nextFiles);
    reset();

    const [file] = nextFiles;

    if (!file) return;

    try {
      const uploaded = await uploadAudio(file).unwrap();

      setAudioFile(uploaded);
    } catch (error) {
      setUploadError(getErrorMessage(error));
    } finally {
      setLocalFiles([]);
    }
  }

  function chooseExisting(id) {
    const found = uploads.find((item) => item.id === id);

    if (!found) return;

    setUploadError('');
    reset();
    setAudioFile(found);
  }

  function clearAudio() {
    setAudioFile(null);
    reset();
  }

  async function transcribe() {
    if (!canTranscribe) return;

    const body = { audioFileId: audioFile.id, modelId: model.id };

    if (languages.length) body.languages = languages;
    if (keywords.length) body.keywords = keywords;

    try {
      const result = await createTranscript(body).unwrap();

      setActiveId(result.transcription.id);
      toast.success('Transcript ready', {
        description: `${result.transcription.creditsCharged.toLocaleString()} credits used`,
      });
    } catch {
      return;
    }
  }

  function openTranscript(item) {
    setActiveId(item.id);

    const source = uploads.find((upload) => upload.id === item.audioFileId);

    if (source) setAudioFile(source);
  }

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-4">
        <Panel title="Audio">
          {audioFile ? (
            <SelectedAudio
              audioFile={audioFile}
              onClear={clearAudio}
              disabled={isWorking}
            />
          ) : (
            <>
              <AudioDropzone
                files={localFiles}
                onFilesChange={changeFiles}
                onError={setUploadError}
                accept={UPLOAD_ACCEPT}
                hint={`MP3, WAV, M4A, WebM, OGG or FLAC up to ${options.maxMegabytes}MB`}
                maxBytes={megabytesToBytes(options.maxMegabytes)}
              />
              {isUploading ? (
                <p
                  className="flex items-center gap-2 text-[12.5px] text-ink-3"
                  aria-live="polite"
                >
                  <Spinner />
                  Uploading...
                </p>
              ) : null}
              {uploads.length ? (
                <Field id="stt-existing" label="Or use a file you uploaded">
                  <Select
                    value=""
                    onValueChange={chooseExisting}
                    disabled={isUploading}
                  >
                    <SelectTrigger id="stt-existing">
                      <SelectValue placeholder="Choose an uploaded file" />
                    </SelectTrigger>
                    <SelectContent>
                      {uploads.map((upload) => (
                        <SelectItem key={upload.id} value={upload.id}>
                          {upload.title} ·{' '}
                          {formatDuration(upload.durationSeconds ?? 0)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              ) : null}
            </>
          )}
          <FormAlert>{uploadError}</FormAlert>
        </Panel>

        {transcription ? (
          <TranscriptPanel
            key={transcription.id}
            transcription={transcription}
            exportFormats={options.exportFormats}
          />
        ) : activeId && transcriptQuery.isFetching ? (
          <Skeleton className="h-72 rounded-2xl" />
        ) : (
          <EmptyTranscript
            isWorking={isTranscribing}
            hasAudio={Boolean(audioFile)}
          />
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <Panel title="Detection">
          <DetectionRow label="Detected language">
            <span className="text-right font-medium">
              {transcription?.languages.length
                ? transcription.languages
                    .map((code) => languageName(options.languages, code))
                    .join(', ')
                : '—'}
            </span>
          </DetectionRow>
          <DetectionRow label="Duration">
            <span className="font-mono text-[12.5px]">
              {transcription?.durationSeconds
                ? formatDuration(transcription.durationSeconds)
                : '—'}
            </span>
          </DetectionRow>
          <DetectionRow label="Credits used">
            <span className="font-mono text-[12.5px]">
              {transcription ? transcription.creditsCharged : '—'}
            </span>
          </DetectionRow>
        </Panel>

        <Panel title="Options">
          {models.length > 1 ? (
            <Field id="stt-model" label="Model">
              <Select value={model?.id ?? ''} onValueChange={setChosenModel}>
                <SelectTrigger id="stt-model">
                  <SelectValue />
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
          ) : null}
          <LanguagePicker
            languages={options.languages}
            maxLanguages={options.maxLanguages}
            value={languages}
            onChange={setLanguages}
          />
          <Field
            id="stt-key-terms"
            label="Key terms"
            hint="Comma separated. Helps spell names and jargon"
            error={keywordError}
          >
            <Input
              id="stt-key-terms"
              value={keyTerms}
              onChange={(event) => setKeyTerms(event.target.value)}
              placeholder="e.g. Fraunces, onboarding, LUFS"
              aria-invalid={Boolean(keywordError)}
              aria-describedby={
                keywordError ? 'stt-key-terms-error' : 'stt-key-terms-hint'
              }
            />
          </Field>
        </Panel>

        <div className="flex flex-col gap-1.5">
          <EstimatedCost credits={cost} />
          {model ? (
            <p className="px-1 text-[11.5px] text-ink-3">
              {model.creditsPerMinute}{' '}
              {model.creditsPerMinute === 1 ? 'credit' : 'credits'} per minute
              of audio, rounded up
            </p>
          ) : (
            <p className="px-1 text-[11.5px] text-danger">
              No transcription model is available right now.
            </p>
          )}
        </div>
        <RequestError error={transcribeError} />

        <Button
          size="lg"
          className="w-full"
          onClick={transcribe}
          disabled={!canTranscribe}
        >
          {isTranscribing ? (
            <>
              <Spinner />
              Transcribing...
            </>
          ) : (
            <>
              <FileText />
              Transcribe audio
            </>
          )}
        </Button>

        <TranscriptHistory
          activeId={activeId}
          onOpen={openTranscript}
          onDeleted={(id) => {
            if (id === activeId) setActiveId(null);
          }}
        />
      </div>
    </div>
  );
}
