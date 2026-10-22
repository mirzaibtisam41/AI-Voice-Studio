'use client';

import { useState } from 'react';
import { Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge, Tag } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  useGetAdminGenerationQuery,
  useRefundGenerationMutation,
} from '@/features/admin/adminApi';
import {
  capabilityLabel,
  formatCredits,
} from '@/features/admin/shared/adminFormat';
import { getErrorMessage } from '@/lib/apiError';
import { formatDateTime, formatDuration } from '@/lib/format';

export const GENERATION_STATUSES = {
  processing: { label: 'Processing', tone: 'info' },
  completed: { label: 'Completed', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
};

const REFUNDABLE_STATUSES = ['completed', 'failed'];

const UNIT_NAMES = {
  text_to_speech: 'characters',
  speech_to_text: 'seconds',
  realtime: 'seconds',
  voice_agent: 'seconds',
  agent_chat: 'messages',
};

function DetailRow({ label, children, mono }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-[12.5px] text-ink-3">{label}</dt>
      <dd
        className={
          mono
            ? 'min-w-0 text-right font-mono text-[12.5px] wrap-break-word'
            : 'min-w-0 text-right text-[13px] wrap-break-word'
        }
      >
        {children}
      </dd>
    </div>
  );
}

function RefundForm({ job }) {
  const [reason, setReason] = useState('');
  const [refund, { isLoading, error }] = useRefundGenerationMutation();
  const canSubmit = reason.trim().length >= 3 && !isLoading;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    try {
      const result = await refund({
        id: job.id,
        reason: reason.trim(),
      }).unwrap();

      toast.success(
        `${formatCredits(result.refundedCredits)} credits refunded to ${job.user?.name ?? 'the user'}`,
      );
    } catch {
      return;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
      <FormAlert>{error ? getErrorMessage(error) : null}</FormAlert>
      <Field
        id="refund-reason"
        label="Refund reason"
        hint="Required, at least 3 characters. Saved in the audit log."
      >
        <Textarea
          id="refund-reason"
          rows={2}
          maxLength={300}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="e.g. Audio was cut off"
        />
      </Field>
      <Button type="submit" disabled={!canSubmit}>
        {isLoading ? <Spinner /> : <Undo2 />}
        Refund {formatCredits(job.creditsCharged)} credits
      </Button>
    </form>
  );
}

function JobDetails({ jobId }) {
  const { data: job, isLoading, error } = useGetAdminGenerationQuery(jobId);

  if (isLoading || error) {
    return (
      <div className="flex flex-col gap-3 p-5">
        <SheetTitle className="sr-only">Job details</SheetTitle>
        {error ? (
          <FormAlert>{getErrorMessage(error)}</FormAlert>
        ) : (
          <>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-72 w-full" />
          </>
        )}
      </div>
    );
  }

  const status =
    GENERATION_STATUSES[job.status] ?? GENERATION_STATUSES.processing;
  const input = job.input ?? {};
  const output = job.output ?? {};
  const refundable =
    REFUNDABLE_STATUSES.includes(job.status) && job.creditsCharged > 0;
  const inputText = input.text ?? input.message;
  const outputText =
    output.editedTranscriptText ?? output.transcriptText ?? output.reply;

  return (
    <>
      <SheetHeader className="border-b p-5">
        <SheetTitle className="font-mono text-[15px]">{job.id}</SheetTitle>
        <SheetDescription className="flex flex-wrap items-center gap-2">
          <Tag>{capabilityLabel(job.capability)}</Tag>
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
          {job.creditsRefunded > 0 ? (
            <StatusBadge tone="neutral" dot={false}>
              Refunded
            </StatusBadge>
          ) : null}
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-5 px-5">
        <dl className="divide-y">
          <DetailRow label="User">
            {job.user ? (
              <>
                {job.user.name}
                <span className="block text-[11.5px] text-ink-3">
                  {job.user.email}
                </span>
              </>
            ) : (
              '—'
            )}
          </DetailRow>
          <DetailRow label="Model" mono>
            {job.model?.name ?? job.providerModelId ?? '—'}
          </DetailRow>
          <DetailRow label="Started" mono>
            {formatDateTime(job.createdAt)}
          </DetailRow>
          {job.completedAt ? (
            <DetailRow label="Completed" mono>
              {formatDateTime(job.completedAt)}
            </DetailRow>
          ) : null}
          {job.failedAt ? (
            <DetailRow label="Failed" mono>
              {formatDateTime(job.failedAt)}
            </DetailRow>
          ) : null}
          {output.durationSeconds ? (
            <DetailRow label="Audio duration" mono>
              {formatDuration(output.durationSeconds)}
            </DetailRow>
          ) : null}
          <DetailRow label="Usage" mono>
            {job.units ?? 0} {UNIT_NAMES[job.capability] ?? 'units'}
            {job.creditsPerUnit ? ` · ${job.creditsPerUnit} cr/unit` : ''}
          </DetailRow>
          <DetailRow label="Credits held" mono>
            {formatCredits(job.creditsHeld)}
          </DetailRow>
          <DetailRow label="Credits charged" mono>
            {formatCredits(job.creditsCharged)}
          </DetailRow>
          <DetailRow label="Credits refunded" mono>
            {formatCredits(job.creditsRefunded)}
          </DetailRow>
          {input.voiceCode ? (
            <DetailRow label="Voice" mono>
              {input.voiceCode}
              {input.format ? ` · ${input.format}` : ''}
            </DetailRow>
          ) : null}
          {input.language ? (
            <DetailRow label="Language" mono>
              {input.language}
            </DetailRow>
          ) : null}
        </dl>
        {inputText ? (
          <section className="flex flex-col gap-1.5">
            <h3 className="text-[13px] font-semibold">Input</h3>
            <p className="max-h-40 overflow-y-auto rounded-xl border bg-field/60 p-3 text-[12.5px] whitespace-pre-wrap text-muted-foreground">
              {inputText}
            </p>
          </section>
        ) : null}
        {outputText ? (
          <section className="flex flex-col gap-1.5">
            <h3 className="text-[13px] font-semibold">Output</h3>
            <p className="max-h-40 overflow-y-auto rounded-xl border bg-field/60 p-3 text-[12.5px] whitespace-pre-wrap text-muted-foreground">
              {outputText}
            </p>
          </section>
        ) : null}
        {job.status === 'failed' ? (
          <section className="flex items-center justify-between gap-2 rounded-xl border border-danger/30 bg-danger/8 p-3.5">
            <h3 className="text-[13px] font-semibold">Error</h3>
            <span className="font-mono text-[12px] text-danger">
              {job.errorCategory ?? 'unknown'}
            </span>
          </section>
        ) : null}
      </div>
      {refundable ? (
        <SheetFooter className="border-t p-5">
          <RefundForm key={job.id} job={job} />
        </SheetFooter>
      ) : null}
    </>
  );
}

export function JobDetailsSheet({ jobId, onOpenChange }) {
  return (
    <Sheet open={Boolean(jobId)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {jobId ? <JobDetails jobId={jobId} /> : null}
      </SheetContent>
    </Sheet>
  );
}
