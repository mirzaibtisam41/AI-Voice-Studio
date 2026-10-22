'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Bookmark, Download, Repeat } from 'lucide-react';
import { AudioDropzone } from '@/components/audio/AudioDropzone';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { EstimatedCost } from '@/components/audio/EstimatedCost';
import { VoicePicker } from '@/components/audio/VoicePicker';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Panel } from '@/components/ui/Panel';
import { SliderField } from '@/components/ui/SliderField';
import { Spinner } from '@/components/ui/Spinner';
import { ToggleRow } from '@/components/ui/ToggleRow';
import { creditsPerStartedMinute, estimateSeconds } from '@/lib/audioEstimates';
import { BeforeAfterPlayers } from '@/features/voice-transformation/BeforeAfterPlayers';
import { useCreditCharge } from '@/hooks/useCreditCharge';
import { ENABLED_VOICES, findVoice } from '@/mocks/voices';

const CREDITS_PER_MINUTE = 8;
const CONVERT_DELAY_MS = 1800;

export function VoiceTransformationView() {
  const { canAfford, charge, shortfallMessage } = useCreditCharge();
  const [files, setFiles] = useState([]);
  const [voiceId, setVoiceId] = useState('cedar');
  const [preservePitch, setPreservePitch] = useState(true);
  const [intensity, setIntensity] = useState(70);
  const [keepBackground, setKeepBackground] = useState(false);
  const [error, setError] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState(null);

  const file = files[0];
  const seconds = estimateSeconds(file);
  const cost = creditsPerStartedMinute(seconds, CREDITS_PER_MINUTE);
  const sourceId = file ? `transform-source-${file.name}-${file.size}` : '';

  function changeFiles(nextFiles) {
    setFiles(nextFiles);
    setError('');
    setResult(null);
  }

  function convert() {
    if (!file || isConverting) return;

    if (!canAfford(cost)) {
      setError(shortfallMessage(cost));
      return;
    }

    setError('');
    setIsConverting(true);

    const voiceName = findVoice(voiceId)?.name ?? voiceId;

    window.setTimeout(() => {
      charge(cost);
      setResult({ id: `transform-${Date.now()}`, voiceName });
      setIsConverting(false);
      toast.success(`Converted to ${voiceName}`, {
        description: `${cost.toLocaleString()} credits used`,
      });
    }, CONVERT_DELAY_MS);
  }

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-4">
        <Panel title="Source audio">
          <AudioDropzone
            files={files}
            onFilesChange={changeFiles}
            onError={setError}
          />
          {file ? (
            <AudioPlayer id={sourceId} label={file.name} duration={seconds} />
          ) : null}
        </Panel>

        {result ? (
          <Panel title="Before / after">
            <BeforeAfterPlayers
              showToggle
              before={{
                id: `${result.id}-original`,
                label: 'Original',
                duration: seconds,
              }}
              after={{
                id: `${result.id}-converted`,
                label: `Converted · ${result.voiceName}`,
                duration: seconds,
              }}
            />
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

        <Panel title="Target voice">
          <VoicePicker
            voices={ENABLED_VOICES}
            value={voiceId}
            onChange={setVoiceId}
          />
        </Panel>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <Panel title="Conversion settings">
          <ToggleRow
            id="transform-preserve-pitch"
            label="Preserve original pitch"
            description="Keep the speaker's natural pitch contour"
            checked={preservePitch}
            onChange={setPreservePitch}
          />
          <SliderField
            id="transform-intensity"
            label="Conversion intensity"
            value={intensity}
            onChange={setIntensity}
            min={0}
            max={100}
            step={1}
            format={(current) => `${current}%`}
          />
          <ToggleRow
            id="transform-keep-background"
            label="Keep background audio"
            description="Leave music and ambience untouched"
            checked={keepBackground}
            onChange={setKeepBackground}
          />
        </Panel>

        <EstimatedCost credits={cost} />
        <FormAlert>{error}</FormAlert>

        <Button
          size="lg"
          className="w-full"
          onClick={convert}
          disabled={!file || isConverting}
        >
          {isConverting ? (
            <>
              <Spinner />
              Converting...
            </>
          ) : (
            <>
              <Repeat />
              Convert voice
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
