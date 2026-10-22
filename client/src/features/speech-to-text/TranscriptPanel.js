'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Copy, Pencil, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
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
import { Textarea } from '@/components/ui/textarea';
import { buildExportFileName } from '@/features/speech-to-text/sttOptions';
import { useUpdateSttTranscriptMutation } from '@/features/speech-to-text/transcriptionsApi';
import { useTranscriptExport } from '@/features/speech-to-text/useTranscriptExport';
import { getErrorMessage } from '@/lib/apiError';

export function TranscriptPanel({ transcription, exportFormats }) {
  const [draft, setDraft] = useState(null);
  const [updateTranscript, { isLoading: isSaving, error: saveError, reset }] =
    useUpdateSttTranscriptMutation();
  const { exportTranscript, isExporting } = useTranscriptExport();
  const isEditing = draft !== null;
  const text = transcription.text ?? '';

  async function copyTranscript() {
    try {
      await navigator.clipboard.writeText(isEditing ? draft : text);
      toast.success('Transcript copied');
    } catch {
      toast.error('Could not copy to the clipboard');
    }
  }

  async function saveTranscript() {
    if (!draft?.trim()) return;

    try {
      await updateTranscript({ id: transcription.id, text: draft }).unwrap();
      setDraft(null);
      toast.success('Transcript saved');
    } catch {
      return;
    }
  }

  async function download(format) {
    try {
      await exportTranscript({
        transcriptionId: transcription.id,
        format,
        fileName: buildExportFileName(transcription.audioTitle, format),
      });
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <Panel
      title="Transcript"
      description={transcription.audioTitle ?? undefined}
      action={
        transcription.isEdited ? (
          <StatusBadge tone="info">Edited</StatusBadge>
        ) : null
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={copyTranscript}>
          <Copy />
          Copy
        </Button>
        <Select value="" onValueChange={download} disabled={isExporting}>
          <SelectTrigger aria-label="Download transcript" className="w-36">
            {isExporting ? <Spinner /> : null}
            <SelectValue placeholder="Download" />
          </SelectTrigger>
          <SelectContent align="end">
            {exportFormats.map((format) => (
              <SelectItem key={format} value={format}>
                {format.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setDraft(null);
                  reset();
                }}
                disabled={isSaving}
              >
                <X />
                Cancel
              </Button>
              <Button
                onClick={saveTranscript}
                disabled={isSaving || !draft.trim()}
              >
                {isSaving ? <Spinner /> : <Save />}
                Save
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setDraft(text)}>
              <Pencil />
              Edit
            </Button>
          )}
        </div>
      </div>

      <label htmlFor="stt-transcript" className="sr-only">
        Transcript text
      </label>
      <Textarea
        id="stt-transcript"
        value={isEditing ? draft : text}
        onChange={(event) => setDraft(event.target.value)}
        readOnly={!isEditing}
        className="min-h-64 resize-y text-[13.5px] leading-relaxed"
      />
      {isEditing && saveError ? (
        <FormAlert>{getErrorMessage(saveError)}</FormAlert>
      ) : null}
    </Panel>
  );
}
