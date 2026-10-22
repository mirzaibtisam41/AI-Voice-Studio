'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, UserRound } from 'lucide-react';
import { PlayButton } from '@/components/audio/AudioPlayer';
import { useMockPlayback } from '@/components/audio/playbackStore';
import { VoiceInitial } from '@/components/audio/VoicePicker';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';

const PREVIEW_SECONDS = 5;

function SavedVoiceRow({ voice, onDelete }) {
  const { isPlaying, toggle } = useMockPlayback(
    `clone-${voice.id}`,
    PREVIEW_SECONDS,
  );
  const isReady = voice.status === 'ready';

  return (
    <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <VoiceInitial voice={voice} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold">{voice.name}</p>
        <p className="truncate text-[11.5px] text-ink-3">
          <span className="font-mono">{voice.samples}</span> samples ·{' '}
          <span className="font-mono">{voice.quality}%</span> quality
        </p>
        <StatusBadge tone={isReady ? 'success' : 'warning'} className="mt-1.5">
          {isReady ? 'Ready' : 'Pending review'}
        </StatusBadge>
      </div>
      <PlayButton
        isPlaying={isPlaying}
        onClick={toggle}
        label={`${voice.name} preview`}
        className="bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
      />
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Delete ${voice.name}`}
        onClick={() => onDelete(voice)}
        className="text-muted-foreground hover:text-danger"
      >
        <Trash2 />
      </Button>
    </li>
  );
}

export function SavedVoicesPanel({ voices, onDelete }) {
  const [pendingDelete, setPendingDelete] = useState(null);

  return (
    <Panel title="Saved custom voices">
      {voices.length ? (
        <ul className="flex flex-col divide-y">
          {voices.map((voice) => (
            <SavedVoiceRow
              key={voice.id}
              voice={voice}
              onDelete={setPendingDelete}
            />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={UserRound}
          title="No custom voices yet"
          description="Voices you clone appear here."
          className="py-6"
        />
      )}

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This voice and its samples are removed permanently. Audio you
            already generated with it is kept.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                onDelete(pendingDelete.id);
                toast.success(`${pendingDelete.name} deleted`);
              }}
            >
              Delete voice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Panel>
  );
}
