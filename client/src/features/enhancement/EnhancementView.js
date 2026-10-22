'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, Bookmark, Download, Sparkles } from 'lucide-react';
import { AudioDropzone } from '@/components/audio/AudioDropzone';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { EstimatedCost } from '@/components/audio/EstimatedCost';
import { Button } from '@/components/ui/button';
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
import { ToggleRow } from '@/components/ui/ToggleRow';
import {
  ENHANCEMENT_OPTIONS,
  ENHANCEMENT_STATS,
  LOUDNESS_TARGETS,
} from '@/features/enhancement/enhancementOptions';
import { CREDITS_PER_MINUTE, perMinuteCredits } from '@/constants/pricing';
import { estimateSeconds } from '@/lib/audioEstimates';
import { BeforeAfterPlayers } from '@/features/voice-transformation/BeforeAfterPlayers';
import { useCreditCharge } from '@/hooks/useCreditCharge';

const ENHANCE_DELAY_MS = 1800;

const INITIAL_OPTIONS = Object.fromEntries(
  ENHANCEMENT_OPTIONS.map((option) => [option.id, option.defaultOn]),
);

function StatsRow({ loudnessLabel }) {
  const stats = ENHANCEMENT_STATS.map((stat) =>
    stat.label === 'Loudness' ? { ...stat, after: loudnessLabel } : stat,
  );

  return (
    <dl className="grid gap-2 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border bg-field px-3 py-2.5"
        >
          <dt className="text-[11.5px] text-ink-3">{stat.label}</dt>
          <dd className="mt-1 flex flex-wrap items-center gap-1.5 font-mono text-[12.5px]">
            {stat.before ? (
              <>
                <span className="text-muted-foreground">{stat.before}</span>
                <ArrowRight
                  className="size-3 text-ink-3"
                  aria-label="to"
                  role="img"
                />
              </>
            ) : null}
            <span className="font-semibold text-success">{stat.after}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function EnhancementView() {
  const { canAfford, charge, shortfallMessage } = useCreditCharge();
  const [files, setFiles] = useState([]);
  const [options, setOptions] = useState(INITIAL_OPTIONS);
  const [intensity, setIntensity] = useState(60);
  const [loudnessTarget, setLoudnessTarget] = useState(
    LOUDNESS_TARGETS[0].value,
  );
  const [error, setError] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [result, setResult] = useState(null);

  const file = files[0];
  const seconds = estimateSeconds(file);
  const cost = perMinuteCredits(seconds, CREDITS_PER_MINUTE.enhancement);
  const hasAnyOption = Object.values(options).some(Boolean);

  function changeFiles(nextFiles) {
    setFiles(nextFiles);
    setError('');
    setResult(null);
  }

  function enhance() {
    if (!file || isEnhancing || !hasAnyOption) return;

    if (!canAfford(cost)) {
      setError(shortfallMessage(cost));
      return;
    }

    setError('');
    setIsEnhancing(true);

    window.setTimeout(() => {
      charge(cost, {
        description: `Audio enhancement · ${file.name}`,
        feature: 'enhancement',
      });
      setResult({
        id: `enhance-${Date.now()}`,
        loudnessLabel: options.loudness
          ? `${loudnessTarget.replace('-', '−')} LUFS`
          : '−23 LUFS',
      });
      setIsEnhancing(false);
      toast.success('Audio enhanced', {
        description: `${cost.toLocaleString()} credits used`,
      });
    }, ENHANCE_DELAY_MS);
  }

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-4">
        <Panel title="Audio to enhance">
          <AudioDropzone
            files={files}
            onFilesChange={changeFiles}
            onError={setError}
          />
          {file && !result ? (
            <AudioPlayer
              id={`enhance-source-${file.name}-${file.size}`}
              label={file.name}
              duration={seconds}
            />
          ) : null}
        </Panel>

        {result ? (
          <Panel title="Before / after">
            <BeforeAfterPlayers
              before={{
                id: `${result.id}-original`,
                label: 'Original',
                duration: seconds,
              }}
              after={{
                id: `${result.id}-enhanced`,
                label: 'Enhanced',
                duration: seconds,
              }}
            />
            <StatsRow loudnessLabel={result.loudnessLabel} />
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
            </div>
          </Panel>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <Panel title="Enhancement options">
          {ENHANCEMENT_OPTIONS.map((option) => (
            <ToggleRow
              key={option.id}
              id={`enhance-${option.id}`}
              label={option.label}
              description={option.description}
              checked={options[option.id]}
              onChange={(checked) =>
                setOptions((current) => ({ ...current, [option.id]: checked }))
              }
            />
          ))}
          {options.loudness ? (
            <Field id="enhance-loudness-target" label="Loudness target">
              <Select value={loudnessTarget} onValueChange={setLoudnessTarget}>
                <SelectTrigger id="enhance-loudness-target">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOUDNESS_TARGETS.map((target) => (
                    <SelectItem key={target.value} value={target.value}>
                      {target.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}
          <SliderField
            id="enhance-intensity"
            label="Processing intensity"
            value={intensity}
            onChange={setIntensity}
            min={0}
            max={100}
            step={1}
            format={(current) => `${current}%`}
          />
        </Panel>

        <EstimatedCost credits={cost} />
        <FormAlert>
          {error ||
            (hasAnyOption ? '' : 'Turn on at least one enhancement option.')}
        </FormAlert>

        <Button
          size="lg"
          className="w-full"
          onClick={enhance}
          disabled={!file || isEnhancing || !hasAnyOption}
        >
          {isEnhancing ? (
            <>
              <Spinner />
              Enhancing...
            </>
          ) : (
            <>
              <Sparkles />
              Enhance audio
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
