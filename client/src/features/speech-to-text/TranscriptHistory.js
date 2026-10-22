'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FileText, Trash2 } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDeleteSttTranscriptMutation,
  useListSttTranscriptsQuery,
} from '@/features/speech-to-text/transcriptionsApi';
import { getErrorMessage } from '@/lib/apiError';
import { formatDateTime, formatDuration } from '@/lib/format';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 8;

function DeleteTranscriptDialog({ transcription, onClose, onDeleted }) {
  const [deleteTranscript, { isLoading }] = useDeleteSttTranscriptMutation();

  async function confirmDelete(event) {
    event.preventDefault();

    try {
      await deleteTranscript(transcription.id).unwrap();
      toast.success('Transcript deleted');
      onDeleted(transcription.id);
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <AlertDialog
      open={Boolean(transcription)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent>
        <div className="flex flex-col gap-1.5">
          <AlertDialogTitle>Delete this transcript?</AlertDialogTitle>
          <AlertDialogDescription>
            The text is removed for good. The audio file stays in your library.
          </AlertDialogDescription>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={confirmDelete}
            disabled={isLoading}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function TranscriptHistory({ activeId, onOpen, onDeleted }) {
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);
  const { data, isLoading, error } = useListSttTranscriptsQuery({
    page,
    limit: PAGE_SIZE,
  });
  const transcriptions = data?.transcriptions ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  if (page > 1 && data && transcriptions.length === 0) {
    setPage(page - 1);
  }

  return (
    <Panel title="Previous transcripts">
      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      ) : error ? (
        <p role="alert" className="text-[12.5px] text-danger">
          {getErrorMessage(error)}
        </p>
      ) : transcriptions.length ? (
        <ul className="flex flex-col gap-2">
          {transcriptions.map((transcription) => (
            <li
              key={transcription.id}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3 py-2',
                transcription.id === activeId
                  ? 'border-brand/60 bg-brand-tint'
                  : 'bg-background/40',
              )}
            >
              <button
                type="button"
                onClick={() => onOpen(transcription)}
                className="min-w-0 flex-1 text-left outline-none focus-visible:underline"
              >
                <span className="block truncate text-[13px] font-medium">
                  {transcription.audioTitle ?? 'Deleted audio'}
                </span>
                <span className="block truncate font-mono text-[11.5px] text-ink-3">
                  {formatDateTime(transcription.createdAt)} ·{' '}
                  {formatDuration(transcription.durationSeconds ?? 0)}
                </span>
              </button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete transcript of ${transcription.audioTitle ?? 'deleted audio'}`}
                onClick={() => setDeleting(transcription)}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={FileText}
          title="No transcripts yet"
          description="Transcripts you make are saved here."
          className="py-6"
        />
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="font-mono text-[11.5px] text-ink-3">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}

      <DeleteTranscriptDialog
        transcription={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={onDeleted}
      />
    </Panel>
  );
}
