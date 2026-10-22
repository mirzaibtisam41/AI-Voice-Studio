'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Download, RotateCcw, Sparkles, Bookmark } from 'lucide-react';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { EstimatedCost } from '@/components/audio/EstimatedCost';
import { VoicePicker } from '@/components/audio/VoicePicker';
import { Button } from '@/components/ui/button';
import { ChoiceChips } from '@/components/ui/ChoiceChips';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Panel } from '@/components/ui/Panel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SliderField } from '@/components/ui/SliderField';
import { Spinner } from '@/components/ui/Spinner';
import { Textarea } from '@/components/ui/textarea';
import { LANGUAGES } from '@/constants/languages';
import { ttsCredits } from '@/constants/pricing';
import { useCreditCharge } from '@/hooks/useCreditCharge';
import {
  CHARACTER_LIMIT,
  CHARACTER_WARNING,
  CHARACTERS_PER_SECOND,
  DEFAULT_SCRIPT,
  OUTPUT_FORMATS,
  STYLES,
  TTS_MODEL,
} from '@/features/text-to-speech/ttsOptions';
import { cn } from '@/lib/utils';
import { ENABLED_VOICES, findVoice } from '@/mocks/voices';

const GENERATE_DELAY_MS = 1600;
const RECENT_LIMIT = 5;

function OptionSelect({ id, label, value, onChange, options, children }) {
  return (
    <Field id={id} label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
          {children}
        </SelectContent>
      </Select>
    </Field>
  );
}

function CharacterCounter({ count }) {
  return (
    <span
      className={cn(
        'shrink-0 font-mono text-[12px]',
        count > CHARACTER_LIMIT
          ? 'text-danger'
          : count > CHARACTER_WARNING
            ? 'text-warning'
            : 'text-ink-3',
      )}
    >
      {count.toLocaleString()} characters
    </span>
  );
}

function TakeMeta({ take }) {
  return (
    <p className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11.5px] text-ink-3">
      <span>{take.voiceName}</span>
      <span>{take.style}</span>
      <span>{take.speed.toFixed(2)}x</span>
      <span>{take.format}</span>
    </p>
  );
}

export function TextToSpeechView() {
  const { canAfford, charge, shortfallMessage } = useCreditCharge();
  const [script, setScript] = useState(DEFAULT_SCRIPT);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [format, setFormat] = useState(OUTPUT_FORMATS[0]);
  const [voiceId, setVoiceId] = useState('marin');
  const [model, setModel] = useState(TTS_MODEL.id);
  const [speed, setSpeed] = useState(1);
  const [style, setStyle] = useState(STYLES[0]);
  const [direction, setDirection] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [takes, setTakes] = useState([]);

  const characterCount = script.length;
  const isOverLimit = characterCount > CHARACTER_LIMIT;
  const cost = ttsCredits(characterCount);
  const canGenerate = script.trim().length > 0 && !isOverLimit && !isGenerating;
  const [latestTake, ...olderTakes] = takes;

  function generate() {
    if (!canGenerate) return;

    if (!canAfford(cost)) {
      setError(shortfallMessage(cost));
      return;
    }

    setError('');
    setIsGenerating(true);

    const settings = {
      voiceName: findVoice(voiceId)?.name ?? voiceId,
      style,
      speed,
      format,
      language,
      duration: Math.max(1, Math.round(characterCount / CHARACTERS_PER_SECOND)),
    };

    window.setTimeout(() => {
      charge(cost, {
        description: `Text to speech · ${findVoice(voiceId)?.name ?? voiceId}`,
        feature: 'textToSpeech',
      });
      setTakes((current) =>
        [{ id: `take-${Date.now()}`, ...settings }, ...current].slice(
          0,
          RECENT_LIMIT + 1,
        ),
      );
      setIsGenerating(false);
      toast.success('Audio generated', {
        description: `${cost.toLocaleString()} credits used`,
      });
    }, GENERATE_DELAY_MS);
  }

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-4">
        <Panel
          title="Script"
          action={<CharacterCounter count={characterCount} />}
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
            className="min-h-[220px] resize-y text-[14px] leading-relaxed"
          />
          <p
            id="tts-script-limit"
            className={cn(
              'text-[12px]',
              isOverLimit ? 'text-danger' : 'text-ink-3',
            )}
          >
            {isOverLimit
              ? `Scripts are limited to ${CHARACTER_LIMIT.toLocaleString()} characters. Shorten it to generate.`
              : `Up to ${CHARACTER_LIMIT.toLocaleString()} characters per take.`}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <OptionSelect
              id="tts-language"
              label="Language"
              value={language}
              onChange={setLanguage}
              options={LANGUAGES}
            />
            <OptionSelect
              id="tts-format"
              label="Output format"
              value={format}
              onChange={setFormat}
              options={OUTPUT_FORMATS}
            />
          </div>
        </Panel>

        <Panel title="Voice">
          <VoicePicker
            voices={ENABLED_VOICES}
            value={voiceId}
            onChange={setVoiceId}
          />
        </Panel>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <Panel title="Settings">
          <Field id="tts-model" label="Model">
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="tts-model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TTS_MODEL.id}>{TTS_MODEL.label}</SelectItem>
                <SelectItem value="more-models-soon" disabled>
                  More models soon
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <SliderField
            id="tts-speed"
            label="Speaking speed"
            value={speed}
            onChange={setSpeed}
            min={0.5}
            max={2}
            step={0.05}
            format={(current) => `${current.toFixed(2)}x`}
          />

          <div className="flex flex-col gap-2">
            <span className="text-[12.5px] text-muted-foreground">
              Style & emotion
            </span>
            <ChoiceChips
              label="Style & emotion"
              options={STYLES}
              value={style}
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
              placeholder="e.g. Speak like a friendly radio host"
              className="min-h-16 resize-none"
            />
          </Field>
        </Panel>

        <EstimatedCost credits={cost} />
        <FormAlert>{error}</FormAlert>

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

        {latestTake ? (
          <Panel title="Latest take">
            <AudioPlayer
              id={latestTake.id}
              label="latest take"
              duration={latestTake.duration}
            />
            <TakeMeta take={latestTake} />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success('Download started')}
              >
                <Download />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success('Saved to library')}
              >
                <Bookmark />
                Save to library
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

        {olderTakes.length ? (
          <Panel title="Recent takes" description="Kept for this session only">
            <ul className="flex flex-col gap-3">
              {olderTakes.map((take, index) => (
                <li key={take.id} className="flex flex-col gap-1.5">
                  <AudioPlayer
                    id={take.id}
                    label={`take ${olderTakes.length - index}`}
                    duration={take.duration}
                    bars={32}
                    className="py-2"
                  />
                  <TakeMeta take={take} />
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
