'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Lightbulb, Wand2 } from 'lucide-react';
import { AudioDropzone } from '@/components/audio/AudioDropzone';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';
import { LANGUAGES } from '@/constants/languages';
import { SampleList } from '@/features/voice-cloning/SampleList';
import { SampleRecorder } from '@/features/voice-cloning/SampleRecorder';
import { SavedVoicesPanel } from '@/features/voice-cloning/SavedVoicesPanel';
import {
  CLONE_COLORS,
  MAX_SAMPLES,
  MIN_SAMPLES,
  SAVED_VOICES,
  sampleQuality,
} from '@/features/voice-cloning/savedVoicesMock';

const ANALYZE_DELAY_MS = 2000;

const TIPS = [
  'Record in a quiet room without echo or background music.',
  'Use the same microphone and distance for every sample.',
  'Speak at a natural pace, the way you want the voice to sound.',
];

let sampleCounter = 0;

function toSample(file) {
  sampleCounter += 1;

  return {
    id: `sample-${sampleCounter}`,
    name: file.name,
    size: file.size,
    quality: sampleQuality(file.name),
  };
}

function missingRequirement({ samples, name, consent }) {
  if (samples.length < MIN_SAMPLES)
    return `Add at least ${MIN_SAMPLES} samples to continue.`;
  if (!name.trim()) return 'Give your voice a name.';
  if (!consent) return 'Confirm you have consent to clone this voice.';

  return '';
}

export function VoiceCloningView() {
  const [samples, setSamples] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [voices, setVoices] = useState(SAVED_VOICES);

  const requirement = missingRequirement({ samples, name, consent });
  const canCreate = !requirement && !isCreating;
  const isFull = samples.length >= MAX_SAMPLES;

  function addSamples(files) {
    if (samples.length + files.length > MAX_SAMPLES) {
      setError(`You can add up to ${MAX_SAMPLES} samples.`);
      return;
    }

    setError('');
    setSamples((current) => [...current, ...files.map(toSample)]);
  }

  function createClone() {
    if (!canCreate) return;

    setIsCreating(true);

    const averageQuality = Math.round(
      samples.reduce((total, sample) => total + sample.quality, 0) /
        samples.length,
    );
    const clone = {
      id: `clone-${Date.now()}`,
      name: name.trim(),
      samples: samples.length,
      quality: averageQuality,
      status: 'pending',
      color: CLONE_COLORS[voices.length % CLONE_COLORS.length],
    };

    window.setTimeout(() => {
      setVoices((current) => [clone, ...current]);
      setSamples([]);
      setName('');
      setDescription('');
      setConsent(false);
      setIsCreating(false);
      toast.success('Voice clone submitted', {
        description: `${clone.name} is pending a consent review.`,
      });
    }, ANALYZE_DELAY_MS);
  }

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-4">
        <Panel
          title="Voice samples"
          action={
            <span className="shrink-0 font-mono text-[12px] text-ink-3">
              {samples.length}/{MAX_SAMPLES}
            </span>
          }
        >
          {isFull ? null : (
            <AudioDropzone
              files={[]}
              onFilesChange={addSamples}
              onError={setError}
              hint="Upload 2–5 clear samples, 30s+ each"
              multiple
            />
          )}
          <SampleList
            samples={samples}
            onRemove={(id) =>
              setSamples((current) =>
                current.filter((sample) => sample.id !== id),
              )
            }
          />
          <SampleRecorder
            onRecorded={(file) => addSamples([file])}
            disabled={isFull}
          />
          <FormAlert>{error}</FormAlert>
        </Panel>

        <Panel title="Voice details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="clone-name" label="Voice name">
              <Input
                id="clone-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. My Narrator Voice"
                maxLength={60}
                required
              />
            </Field>
            <Field id="clone-language" label="Language">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="clone-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field id="clone-description" label="Description">
            <Textarea
              id="clone-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional — helps you tell voices apart later"
              className="min-h-20 resize-none"
            />
          </Field>
          <div className="flex items-start gap-3 rounded-xl border bg-field px-3 py-3">
            <Checkbox
              id="clone-consent"
              checked={consent}
              onCheckedChange={(checked) => setConsent(checked === true)}
              aria-required="true"
              className="mt-0.5"
            />
            <label
              htmlFor="clone-consent"
              className="cursor-pointer text-[12.5px] leading-relaxed text-muted-foreground"
            >
              I confirm I have the legal right to clone this voice and consent
              to its use on AI Voice Studio.
            </label>
          </div>
        </Panel>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full"
            onClick={createClone}
            disabled={!canCreate}
            aria-describedby="clone-requirement"
          >
            {isCreating ? (
              <>
                <Spinner />
                Analyzing samples...
              </>
            ) : (
              <>
                <Wand2 />
                Create voice clone
              </>
            )}
          </Button>
          <p
            id="clone-requirement"
            className="text-center text-[12px] text-ink-3"
          >
            {requirement ||
              'New clones are reviewed for consent before they can be used.'}
          </p>
        </div>

        <SavedVoicesPanel
          voices={voices}
          onDelete={(id) =>
            setVoices((current) => current.filter((voice) => voice.id !== id))
          }
        />

        <Panel title="Tips for great samples">
          <ul className="flex flex-col gap-2.5">
            {TIPS.map((tip) => (
              <li
                key={tip}
                className="flex gap-2.5 text-[12.5px] text-muted-foreground"
              >
                <Lightbulb
                  className="mt-0.5 size-3.5 shrink-0 text-amber"
                  aria-hidden="true"
                />
                {tip}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
