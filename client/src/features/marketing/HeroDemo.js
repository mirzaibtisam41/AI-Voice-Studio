'use client';

import { useEffect, useRef, useState } from 'react';
import { AudioLines } from 'lucide-react';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { Button } from '@/components/ui/button';
import { ChoiceChips } from '@/components/ui/ChoiceChips';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Textarea } from '@/components/ui/textarea';
import {
  DEMO_CHARACTER_LIMIT,
  DEMO_TEXT,
  DEMO_VOICES,
} from '@/features/marketing/landingContent';

const GENERATION_DELAY_MS = 1200;
const CHARACTERS_PER_SECOND = 15;

export function HeroDemo() {
  const [text, setText] = useState(DEMO_TEXT);
  const [voice, setVoice] = useState(DEMO_VOICES[0].value);
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const trimmedText = text.trim();
  const voiceLabel = DEMO_VOICES.find((option) => option.value === voice).label;

  const handleGenerate = () => {
    setIsGenerating(true);
    setPreview(null);
    timerRef.current = setTimeout(() => {
      setIsGenerating(false);
      setPreview({
        id: `landing-demo-${voice}-${Date.now()}`,
        label: `${voiceLabel} preview`,
        duration: Math.max(
          3,
          Math.ceil(trimmedText.length / CHARACTERS_PER_SECOND),
        ),
      });
    }, GENERATION_DELAY_MS);
  };

  return (
    <div
      id="demo"
      className="relative scroll-mt-24 rounded-2xl border bg-card/90 p-5 shadow-[0_30px_80px_-40px_var(--brand-glow)] backdrop-blur sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-tint text-brand">
            <AudioLines className="size-4" aria-hidden="true" />
          </span>
          <p className="font-semibold">Try text to speech</p>
        </div>
        <StatusBadge tone="neutral">Sample preview</StatusBadge>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="landing-demo-text">Your text</Label>
        <Textarea
          id="landing-demo-text"
          value={text}
          maxLength={DEMO_CHARACTER_LIMIT}
          onChange={(event) => setText(event.target.value)}
          className="min-h-28 resize-none text-[14px] leading-relaxed"
        />
        <p className="self-end font-mono text-[11.5px] text-ink-3">
          {text.length} / {DEMO_CHARACTER_LIMIT}
        </p>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        <p className="text-[13px] font-medium">Voice</p>
        <ChoiceChips
          label="Voice"
          options={DEMO_VOICES}
          value={voice}
          onChange={setVoice}
        />
      </div>

      <Button
        size="lg"
        className="mt-5 w-full"
        disabled={!trimmedText || isGenerating}
        onClick={handleGenerate}
      >
        {isGenerating ? <Spinner /> : null}
        {isGenerating ? 'Generating preview…' : 'Generate preview'}
      </Button>

      <div aria-live="polite" className="mt-4">
        {preview ? (
          <AudioPlayer
            id={preview.id}
            label={preview.label}
            duration={preview.duration}
          />
        ) : null}
      </div>

      <p className="mt-3 text-center text-[12px] text-ink-3">
        This is a sample preview with placeholder audio. Create a free account
        to generate real speech.
      </p>
    </div>
  );
}
